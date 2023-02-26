import { describe, expect, it, vi } from 'vitest';
import { createEmailMessage } from '../test/helpers/createEmailMessage';
import { email } from './index';

describe(email.name, async () => {
  // @ts-ignore -- defined in .env using vitest-environment-miniflare
  const DISCORD_WEBHOOK_URL = DISCORD_TEST_WEBHOOK_URL;

  // Disable Fetch API from making real network requests
  const fetchMock = getMiniflareFetchMock();
  fetchMock.disableNetConnect();

  // Intercept calls to Discord's webhook API
  const origin = fetchMock.get('https://discord.com');
  origin
    .intercept({ method: 'POST', path: /api\/webhooks\/.*/ })
    .reply(200, 'Discord is happy in this Mock!')
    .persist();

  it('handles a test email', async () => {
    // Arrange
    const message: EmailMessage = await createEmailMessage();

    // Act
    const call = email(message, { DISCORD_WEBHOOK_URL }, {});

    // Assert
    await expect(call).resolves.toBeUndefined();
  });

  it('does not leave open connections', async () => {
    // Arrange
    const message: EmailMessage = await createEmailMessage();

    // Act
    await email(message, { DISCORD_WEBHOOK_URL }, {});

    // Assert
    fetchMock.assertNoPendingInterceptors();
  });

  it('uses the webhook url', async () => {
    // Arrange
    const fetchSpy = vi.spyOn(global, 'fetch');
    const message: EmailMessage = await createEmailMessage();

    // Act
    await email(message, { DISCORD_WEBHOOK_URL }, {});

    // Assert
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(DISCORD_WEBHOOK_URL, expect.anything());
  });

  it('correctly passes the body to the webhook', async () => {
    // Arrange
    const fetchSpy = vi.spyOn(global, 'fetch');
    const message: EmailMessage = await createEmailMessage({ body: 'Hello\nI have a question\nBye!' });

    // Act
    await email(message, { DISCORD_WEBHOOK_URL }, {});

    // Assert
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ body: expect.stringContaining('I have a question') }),
    );
  });

  it('splits long bodies over multiple calls', async () => {
    // Arrange
    const fetchSpy = vi.spyOn(global, 'fetch');
    const message: EmailMessage = await createEmailMessage({
      from: 'sender@example.com',
      to: 'recipient@examples.com',
      subject: 'Question about foo',
      body:
        'Attack feet behind the couch destroy couch flop over give attitude hide when guests come over hopped up on goofballs hunt anything that moves bag stretch swat at dog all of a sudden go crazy flop over leave dead animals as gifts  stand in front of the computer screen   rub face on everything  claw drapes lick butt intently stare at the same spot,  intrigued by the shower chase mice why must they do that make muffins attack feet make muffins leave dead animals as gifts give attitude why must they do that flop over  stand in front of the computer screen  hide when guests come over all of a sudden go crazy  claw drapes bag stretch hopped up on goofballs. Flop over why must they do that swat at dog hopped up on goofballs  claw drapes attack feet lick butt behind the couch hide when guests come over hunt anything that moves, flop over  rub face on everything all of a sudden go crazy  intrigued by the shower chase mice make muffins give attitude leave dead animals as gifts destroy couch  stand in front of the computer screen , bag stretch intently stare at the same spot behind the couch chase mice give attitude make muffins  intrigued by the shower destroy couch. Hunt anything that moves swat at dog lick butt hide when guests come over give attitude bag stretch flop over all of a sudden go crazy chase mice,  stand in front of the computer screen  leave dead animals as gifts hopped up on goofballs make muffins intently stare at the same spot flop over  rub face on everything,  claw drapes  intrigued by the shower destroy couch behind the couch attack feet why must they do that lick butt. Give attitude bag stretch hide when guests come over hunt anything that moves behind the couch make muffins flop over swat at dog leave dead animals as gifts, intently stare at the same spot  stand in front of the computer screen  lick butt  intrigued by the shower all of a sudden go crazy destroy couch. Flop over flop over intently stare at the same spot bag stretch behind the couch destroy couch hunt anything that moves  rub face on everything  claw drapes, lick butt hide when guests come over  stand in front of the computer screen  swat at dog attack feet give attitude  intrigued by the shower hopped up on goofballs, all of a sudden go crazy make muffins leave dead animals as gifts why must they do that chase mice hide when guests come over swat at dog.\n' +
        '\n' +
        'Leave dead animals as gifts behind the couch why must they do that give attitude hunt anything that moves  rub face on everything swat at dog attack feet  claw drapes lick butt, flop over destroy couch chase mice all of a sudden go crazy intently stare at the same spot make muffins hopped up on goofballs flop over.\n' +
        '\n' +
        'Give attitude attack feet behind the couch make muffins leave dead animals as gifts flop over intently stare at the same spot  stand in front of the computer screen  swat at dog hopped up on goofballs  intrigued by the shower bag stretch, destroy couch  rub face on everything chase mice lick butt flop over hunt anything that moves hide when guests come over  claw drapes why must they do that all of a sudden go crazy bag stretch swat at dog, hunt anything that moves chase mice  rub face on everything destroy couch all of a sudden go crazy intently stare at the same spot flop over  stand in front of the computer screen  behind the couch hopped up on goofballs.  claw drapes lick butt  stand in front of the computer screen  chase mice leave dead animals as gifts give attitude hunt anything that moves  intrigued by the shower hide when guests come over swat at dog intently stare at the same spot flop over  rub face on everything, why must they do that attack feet bag stretch behind the couch flop over hopped up on goofballs make muffins all of a sudden go crazy destroy couch  intrigued by the shower chase mice. Make muffins chase mice flop over attack feet flop over swat at dog  stand in front of the computer screen  bag stretch  rub face on everything hunt anything that moves all of a sudden go crazy leave dead animals as gifts  claw drapes, destroy couch  intrigued by the shower hide when guests come over why must they do that give attitude intently stare at the same spot behind the couch hopped up on goofballs lick butt  stand in front of the computer screen . Destroy couch hide when guests come over attack feet give attitude flop over lick butt hopped up on goofballs  rub face on everything, why must they do that swat at dog  intrigued by the shower flop over intently stare at the same spot.',
    });

    // Act
    await email(message, { DISCORD_WEBHOOK_URL });

    // Assert
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    fetchMock.assertNoPendingInterceptors();
  });
});

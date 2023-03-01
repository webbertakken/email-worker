import { vi } from 'vitest';

export interface Props {
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  headers?: Record<string, string>;
  blob?: Blob;
}

export const createEmailMessage = (overrides: Partial<Props> = {}): EmailMessage => {
  const from = typeof overrides.from !== 'undefined' ? overrides.from : 'sender@example.com';
  const to = typeof overrides.to !== 'undefined' ? overrides.to : 'recipient@example.com';
  const subject = typeof overrides.subject !== 'undefined' ? overrides.subject : 'Question about foo';
  const body =
    typeof overrides.body !== 'undefined'
      ? overrides.body
      : 'Hello, I have a question about foo:\n\nBar?\n\nThanks!\nBaz';
  const headers = typeof overrides.headers !== 'undefined' ? overrides.headers : {};
  const blob =
    typeof overrides.blob !== 'undefined'
      ? overrides.blob
      : new Blob([createRawEmail(from, to, subject, body)], { type: 'text/plain' });

  return {
    from,
    to,
    headers: new Headers({ From: from, To: to, Subject: subject, 'Content-Type': 'text/plain', ...headers }),
    raw: blob.stream(),
    rawSize: blob.size,
    setReject: vi.fn(),
    forward: vi.fn(),
  };
};

const createRawEmail = (from: string, to: string, subject: string, body: string) => {
  return `Delivered-To: ${to}
Received: by 2002:adf:a19a:0:0:0:0:0 with SMTP id u26c11111196wru;
        Tue, 21 Feb 2023 14:46:42 -0800 (PST)
X-Received: by 2002:a05:600c:1895:b0:3df:1673:90b6 with SMTP id x21-20020a234234234500b003df167390b6mr4654870wmp.39.1677019601912;
        Tue, 21 Feb 2023 14:46:41 -0800 (PST)
ARC-Seal: i=1; a=rsa-sha256; t=1677019601; cv=none;
        d=google.com; s=arc-20160816;
        b=vqTYiEEmn5IS4MM2rs4g44444khIVN234tWU/aHv92r5Vb9wTCOECpPnC6n0KM
         i0NDWJIEpyyuyMb6YJY1T44444jGneaU2342345Nm8eRPHU60z XrvagK8+juVp65Dhz
         1N6U9mW5lC+3O6PbiA2ia44444AFhlW+r4Xjt4zT+nelzPSBShXiI4z154/ts9ecFIPt
         KNMLUPD2ByQUB7UexKych44444QCLMq6234234234Yrun2ZGHeunboK1u1iH3Tj+J3jn
         MiPSaaMlfNoS10oGnM75v444442345345lngJjiDDYTiNcBYdGrlZi3MdVwM69j3wWD
         jmOA==
ARC-Message-Signature: i=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20160816;
        h=in-reply-to:references:subject:from:date:message-id:auto-submitted
         :to:dkim-signature;
        bh=GAfzkLhabIwe1zs4AgRHS44444pLrB+CUIKQb2sNQWqY=;
        b=LwK1i2s5wcn3W3nymYegGV444445345Z28/t35o311D07rmaeU1jPRE6zjyFH
         wZMK2dfqphZQNWzmd1buQNv44444do9Eh6NY4B180Z43556666srOOZBQNpDwSNP/wMF+
         UT58gDEw8AaZ8DmlOB8Kpso44444h8PEHVeVNihDfWAqK66666rHEMmHkIiiLwpy8Xdw/
         +wCNki6yE8aT+RGSSFXrft644444o6gHQsNScbUyUIR7BA5666x8JQTYUxVZgep8TkOow
         6OkCOgZ2gmdB8qy1ClnjKpl44444+OTLJQrQetWETpF6ZOK666M8UG4lDfvuB4UUODB3j
         3JcA==
ARC-Authentication-Results: i=1; mx.google.com;
       dkim=pass header.i=@googlemail.com header.s=20210662 header.b=fqFbDrR7;
       spf=none (google.com: mail-sor-f69.google.com does not designate permitted sender hosts) smtp.helo=mail-sor-f69.google.com;
       dmarc=pass (p=QUARANTINE sp=QUARANTINE dis=NONE) header.from=googlemail.com
Return-Path: <>
Received: from mail-sor-f69.google.com (mail-sor-f69.google.com. [209.85.220.69])
        by mx.google.com with SMTPS id x12-20020a5d6b4c000006666666521a2ca9sor2143201wrw.70.2023.02.21.14.46.41
        for <${to}>
        (Google Transport Security);
        Tue, 21 Feb 2023 14:46:41 -0800 (PST)
Received-SPF: none (google.com: mail-sor-f69.google.com does not designate permitted sender hosts) client-ip=209.85.220.69;
Authentication-Results: mx.google.com;
       dkim=pass header.i=@googlemail.com header.s=20210112 header.b=fqFb12R7;
       spf=none (google.com: mail-sor-f69.google.com does not designate permitted sender hosts) smtp.helo=ma1234r-f69.google.com;
       dmarc=pass (p=QUARANTINE sp=QUARANTINE dis=NONE) header.from=googlemail.com
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=googlemail.com; s=20210112;
        h=in-reply-to:references:subject:from:date:message-id:auto-submitted
         :to:from:to:cc:subject:date:message-id:reply-to;
        bh=GAfzkLhabIwe1zs4AgRHSI7x/pLrB+CUIKQb2sNQWqY=;
        b=fqFbDrR7QdP3BvHtemC44444PcsFnBBN4ikb8iukwuKFYC7ekJPZmWzk+l6HTMIB
         hpiN0O/yGoMD6f12WyN844444sTmUJapwOdRQKq9MvXg+9jOR0uBm5gjA8LrefE6LZ20
         PEias4A39scRrKZ/lXAl44444qvxihl0iiPV7K5dBxKKKdvV7V5cfmFdY0XdLgX5UkcJ
         S8AXFrHcVDCITe4dxvCZ44444yUmcLoWbXO/SYNKipAqgcdYv6MxmTFH7IX1lf2SDr8Q
         Px9aNqc68/qsI2G5SCSA44444T4NrXkfVhPfKdj7erlErx3rpmttKX0ADSGwNROFyoZ8
         xlXg==
X-Google-DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=1e100.net; s=20210112;
        h=in-reply-to:references:subject:from:date:message-id:auto-submitted
         :to:x-gm-message-state:from:to:cc:subject:date:message-id:reply-to;
        bh=GAfzkLhabIwe1zs4Ag44444RHSI7x/pLrB+CUIKQb2sNQWqY=;
        b=zXx7fV7COTHpxtsPHGn44444HFudw6/cqhuAbEBmmC4YdPjDs+62UK1x5Wd3DVFNm
         iluvQlcsCdPBUftscBrF44444EHpPWqSqwAx/Cr99GL8GVJGJzCl5NAD+WjTtgE+Igs
         fEa4spw14UwX8LAo72qN44444OYV/u/UcZ0aTotWWhml+7D+YpgsZSGlXmE2/gvQG5H
         i2DaD7yVXWzrVLGH6dmg44444Vitsk8HmovNTpsvvXQZmOSgl2akJVUuXoAH6JhlqAT
         bZ3Lj2VIDGsxicp24WzB44444yzjvalB+vLUf36MTvGzD/9g13bhNK3YXd/kyYPl3bb
         SSIA==
X-Gm-Message-State: AO0yUKUhy+CR7qLYG7/c9o944444NKjKLhvhKj/OpV6EnNp73suwRhSx ctiz9ls0/kErXFpNH0Q1FZsA6c1ZcRg/aQPH9Co4nA==
X-Google-Smtp-Source: AK7set80g5zzcW6SQHkn1et/qfVLU44444+UM6iJ9VroVPPLOe5DhNJjaG7KhBNx1bbNrQ42nNf5ZeoPqHrCrFbenkf7P2cKYGyDp2g=
X-Received: by 2002:a05:4444:5c1:b0:2c5:7dd2:31a1 with SMTP id bh1-20020a05644444444c57dd231a1mr427489wrb.6.1677019601845;
        Tue, 21 Feb 2023 14:46:41 -0800 (PST)
Content-Type: multipart/report; boundary="000000000000a6227e05f53d8da4"; report-type=delivery-status
To: ${from}
Received: by 2002:a05:6000:5c1:b0:2c5:7dd2:31a1 with SMTP id bh1-20020a05600005c234234231a1mr558687wrb.6; Tue, 21 Feb 2023 14:46:41 -0800 (PST)
Return-Path: <>
Auto-Submitted: auto-replied
Message-ID: <63f549d1.4444444.aaa0c.49ef.GMR@mx.google.com>
Date: Tue, 21 Feb 2023 14:46:41 -0800 (PST)
From: Mail Delivery Subsystem <${from}>
Subject: ${subject}
References: <CACWuFZ-JLZTRp1f444444pmrYN_SmbK191=H2H0semg@mail.gmail.com>
In-Reply-To: <CACWuFZ-JLZTRp1f444444gducNpmrYN_SmbK191=H2H0semg@mail.gmail.com>
X-Failed-Recipients: ${to}

--000000000000a6227e05f53d8da4
Content-Type: multipart/related; boundary="000000000000a638c805f53d8da5"

--000000000000a638c805f53d8da5
Content-Type: multipart/alternative; boundary="000000000000a638cf05f53d8da6"

--000000000000a638cf05f53d8da6
Content-Type: text/plain; charset="UTF-8"

${body}

--000000000000a638cf05f53d8da6
Content-Type: text/html; charset="UTF-8"

<html>
<head>
<style>
* {
font-family:Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;
}
</style>
</head>
<body>
${body}
</body>
</html>

--000000000000a638cf05f53d8da6--
--000000000000a638c805f53d8da5
Content-Type: image/png; name="icon.png"
Content-Disposition: attachment; filename="icon.png"
Content-Transfer-Encoding: base64
Content-ID: <icon.png>


--000000000000a638c805f53d8da5
Content-Type: image/png; name="warning_triangle.png"
Content-Disposition: attachment; filename="warning_triangle.png"
Content-Transfer-Encoding: base64
Content-ID: <warning_triangle.png>


--000000000000a638c805f53d8da5--
--000000000000a6227e05f53d8da4
Content-Type: message/delivery-status


--000000000000a6227e05f53d8da4
Content-Type: message/rfc822

DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=gmail.com; s=20210112;
        h=to:subject:message-id:date:from:reply-to:mime-version:from:to:cc
         :subject:date:message-id:reply-to;
        bh=H5SvFsHeXs56eE4444UH93W8LdBf3Oj6N6dlAE8Aw8s=;
        b=Vis3ze3bmg4cBNA4444pIFQphc7+NTztePmxqxgcokvwLtOpxj9WWej+axZS7Ha3Pr
         wEdByysbI5hy+l7k4444l48td6yN1ekzEeVA/HkDwB4q43tcV5gfOM0THd38isy6MBdC
         5e3rz2jREa11vTdZ4444A4GW+iWWiEaOTIfOyBFbFIlkEa0f/8UkOvjKvfKGxTHGfkcz
         VxTskrKlM+ko0UHX44448SMRuRMRYVowedKKRB6kDN6c/5m1ktR9TXchaKXV4i47NtBT
         H36JjVnkqVABxuU64444ravF7/J0+/1XzjxvNYzXQ5eS8uM8TU2PrCJpplMHI1HVq5ml
         F+sw==
X-Google-DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=1e100.net; s=20210112;
        h=to:subject:message-id:date:from:reply-to:mime-version
         :x-gm-message-state:from:to:cc:subject:date:message-id:reply-to;
        bh=H5SvFsHeXs56eEP4444493W8LdBf3Oj6N6dlAE8Aw8s=;
        b=kFGI9MKgTj/UbZIP44444XcG9pH57Qp1SPW2hMHGz6KkJV5ZPb/Aes/62sNyU+a7LU
         sW1bvtQAi5XWXEOii44444ZKF/FGDfpcAfWUGEbOidoAYVUDCkP49vn+wxSTUG7KO+aA
         FHOvORb9qD0vy+1qk44444MLzTjevlmCc7rkLRMFhaVtf3Uu3OFF+4M9Ye2c1KT1Xfhd
         bNFQg1Gixp6GG6UYt44444x0arP1v6UjU0QqhUepIrrTyNWOwtqljqPTsqgPa3qVO5uN
         FUugmvJD2bn3TKYt744444D9SHDYqOZtCmofeGDUtZsOJjvmIbzZpf1ytigUuNU4JXxv
         dhdw==
X-Gm-Message-State: AO0yUKXNZlHroATyl44444444aOubqPya+fOsrkCZ3kh8IkIhoGI/s 9tjprddai+3IXyNRp93yX5BdPZ4ujA5C6mvTPjj+ls/eppBRBLHV
X-Google-Smtp-Source: AK7set/3uQ7Pj/i44444444yV452iAzA4yovLNo1SQYhCoVtcqspjUn8pGo63NhptVi4C3WeEvJp1zD7YbpX/dSk8=
X-Received: by 2002:a05:6000:5c1:b0:2c5:7dd2:31a1 with SMTP id bh1-20020a0560000544444457dd231a1mr427481wrb.6.1677019600435; Tue, 21 Feb 2023 14:46:40 -0800 (PST)
MIME-Version: 1.0
Reply-To: ${from}
From: Name of Sender <${from}>
Date: Tue, 21 Feb 2023 23:46:29 +0100
Message-ID: <CACWuFZ-JLZTRp1fw84444444_SmbK191=H2H0semg@mail.gmail.com>
Subject: ${subject}
To: ${to}
Content-Type: multipart/alternative; boundary="00000000000090bbe205f53d8d8e"

--00000000000090bbe205f53d8d8e

----- Message truncated -----
--00000000000090bbe205f53d8d8e--

--000000000000a6227e05f53d8da4--`;
};

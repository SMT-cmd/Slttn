# Google AdSense deployment

SLT Trade Hub uses the verified AdSense publisher account
`ca-pub-8661087498876975`.

## Deployment environment variable

Set this public build-time variable for Production, Preview, and Development:

```text
VITE_ADSENSE_CLIENT=ca-pub-8661087498876975
```

The application includes the verified publisher as a safe fallback, so the
account meta tag is still rendered if a deployment is missing the variable.
The environment variable remains the recommended deployment configuration.

## Integration behavior

- The document head renders `google-adsense-account` with the publisher ID.
- `/ads.txt` publishes the Google-authorized seller record.
- The AdSense JavaScript uses the same publisher ID and is rendered in the
  document head on every page of both `slttradehub.trade` and
  `library.slttradehub.trade`, allowing Auto ads and Google's consent message
  to initialize on either host.
- Consent Mode defaults advertising and analytics storage to denied unless the
  visitor has already granted consent. The consent choice is initialized before
  the external AdSense script.

## Main domain and library subdomain

Only add `slttradehub.trade` on the AdSense Sites page. AdSense manages ordinary
subdomains under their registered parent domain, so do not add
`library.slttradehub.trade` as a separate site. The shared application shell
already places the same AdSense account code on every public page on both hosts.

Turn on **Auto ads** for `slttradehub.trade` in AdSense and apply the settings to
the site. Recommended starting formats are in-page banner ads, anchor ads,
vignette ads, and desktop side rails. Use page exclusions for sign-in, account,
checkout, admin, and book-reader pages if AdSense proposes placements there.

For visitors in the EEA, UK, and Switzerland, configure Google's certified CMP
under **Privacy & messaging** in AdSense. The local cookie preference remains a
privacy-preserving default, but it is not a replacement for Google's certified
TCF consent message where that requirement applies.

No AdSense client secret is required. The publisher ID and `ads.txt` seller
record are intentionally public.

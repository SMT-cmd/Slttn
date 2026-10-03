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
- The AdSense JavaScript uses the same publisher ID and loads only after the
  visitor grants advertising-cookie consent.

No AdSense client secret is required. The publisher ID and `ads.txt` seller
record are intentionally public.

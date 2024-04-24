import sendgrid from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  throw Error('Invalid SendGrid API Key.');
}
sendgrid.setApiKey(apiKey);

export default sendgrid;

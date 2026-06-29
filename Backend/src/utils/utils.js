export function generateOTP(){
  return Math.floor(10000 + Math.random() * 900000).toString();
}

export function getOtpHtml(otp) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>OTP Verification</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
        <tr>
          <td align="center">

            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

              <tr>
                <td align="center" style="background:#2563eb;padding:30px;">
                  <h1 style="color:#ffffff;margin:0;">User Authentication</h1>
                </td>
              </tr>

              <tr>
                <td style="padding:40px;">

                  <h2 style="margin-top:0;color:#333333;">
                    Verify Your Email
                  </h2>

                  <p style="font-size:16px;color:#555555;line-height:1.6;">
                    Hello,
                  </p>

                  <p style="font-size:16px;color:#555555;line-height:1.6;">
                    Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address.
                  </p>

                  <div style="text-align:center;margin:35px 0;">
                    <span style="
                      display:inline-block;
                      background:#2563eb;
                      color:#ffffff;
                      font-size:32px;
                      font-weight:bold;
                      letter-spacing:8px;
                      padding:18px 40px;
                      border-radius:8px;
                    ">
                      ${otp}
                    </span>
                  </div>

                  <p style="font-size:15px;color:#555555;line-height:1.6;">
                    This OTP is valid for <strong>10 minutes</strong>.
                  </p>

                  <p style="font-size:15px;color:#555555;line-height:1.6;">
                    If you didn't request this verification, you can safely ignore this email.
                  </p>

                  <hr style="border:none;border-top:1px solid #eeeeee;margin:35px 0;">

                  <p style="font-size:13px;color:#888888;text-align:center;">
                    This is an automated email. Please do not reply.
                  </p>

                </td>
              </tr>

              <tr>
                <td align="center" style="background:#f8f9fa;padding:20px;color:#888888;font-size:13px;">
                  © ${new Date().getFullYear()} User Authentication. All rights reserved.
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
}


import nodemailer, { Transporter } from "nodemailer"
import pug from "pug"
import { IUserDocument } from "../models/userModel"

//CREATING A GENERAL EMAIL CLASS TO ENCAPSULATE THE EMAIL PROCESS
class Email {
  public readonly from: string = process.env.FROM_EMAIL || "default@example.com"
  private to: string
  private firstName: string

  constructor(
    private user: IUserDocument,
    private url: string,
  ) {
    this.to = user.email
    this.firstName = user.name.split(" ").at(0)!
  }
  newtTransportor(): Transporter {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        host: process.env.PRODUCTION_SMPT_HOST, //  SMTP host
        port: 587, // Secure SMTP port
        auth: {
          user: process.env.PRODUCTION_SMPT_USER,
          pass: process.env.PRODUCTION_SMPT_PASSWORD,
        },
      })
    } else {
      return nodemailer.createTransport({
        host: process.env.DEVELOPMENT_SMPT_HOST,
        port: 2525,
        auth: {
          user: process.env.DEVELOPMENT_SMPT_USER,
          pass: process.env.DEVELOPMENT_SMPT_PASSWORD,
        },
      })
    }
  }
  async send(template: string, subject: string) {
    //1)render the htmlbased on the bug template

    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstname: this.firstName,
      url: this.url,
      subject,
    })

    //2)define email options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mailOptions: Record<any, any> = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: `hello ${this.firstName} url: ${this.url}`,
    }

    //3)create transport + send email
    await this.newtTransportor().sendMail(mailOptions)
  }
  async sendWelcome() {
    await this.send("welcome", "Welcom/viewe to the IO")
  }
  async passwordReset() {
    try {
      await this.send("reset", "Password Reset")
      console.log("SMTP Host:", process.env.DEVELOPMENT_SMPT_HOST)
      console.log("SMTP Port:", process.env.DEVELOPMENT_SMPT_PORT || 2525)
      console.log("SMTP User:", process.env.DEVELOPMENT_SMPT_USER)
      console.log("SMTP Password:", process.env.DEVELOPMENT_SMPT_PASSWORD)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log("ERROR SENDING EMAIL", err)
    }
  }
}

export default Email

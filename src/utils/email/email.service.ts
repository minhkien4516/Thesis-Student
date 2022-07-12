import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendRegistrationMail(
    email: string,
    firstName: string,
    lastName: string,
    host: string,
    token: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify your account',
        template: './email.hbs',
        context: {
          firstName,
          lastName,
          host,
          token,
        },
        html:
          `<h2>Hello ${lastName} ${firstName}</h2>` +
          `<h3>Welcome you to my BIG thesis-app</h3>` +
          `<h3>Thanks for joining to my system</h3>` +
          '<p>Please verify your account by clicking this:</p>' +
          `<a style='text-decoration: none' ` +
          `href='http://${host}/auth/confirmation/${token}'>` +
          `<h1 style='display: inline-block, color: #0194f3'>Verification link</h1>` +
          `</a>` +
          `<br />` +
          '<h4>Thank You!</h4>',
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async sendResetPasswordCode(email: string, resetPasswordCode: number) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset your password',
        html:
          `<p>Here is your reset password code:</p>` +
          `<h1 style='display: inline-block'>${resetPasswordCode}</h1>` +
          `<p>Please do not share this code to anyone!</p>` +
          `<br />` +
          '<h4>Thank You!</h4>',
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async sendAcceptedMailToStudent(
    teacherEmail: string,
    teacherName: string,
    teacherPhoneNumber: string,
    studentEmail: string,
    studentName: string,
    academicYear: string,
  ) {
    try {
      await this.mailerService.sendMail({
        from: teacherEmail,
        to: studentEmail,
        subject: 'Trả lời về đăng kí giảng viên hướng dẫn',
        context: {
          teacherEmail,
          teacherName,
          teacherPhoneNumber,
          studentEmail,
          studentName,
          academicYear,
        },
        html:
          `<h3 style='color: #0194f3'>Xin chào bạn <b>${studentName}</b>,</h3>` +
          `<p>Thầy/Cô rất vui khi nhận được thông tin Đăng kí giảng viên hướng dẫn từ bạn.</p>` +
          `<p>Thầy/Cô <b>${teacherName}</b> <b>ĐỒNG Ý</b> làm Giảng viên hướng dẫn cho bạn trong năm học <b>${academicYear}</b>.</p>` +
          `<p>Rất mong bạn sẽ hoàn thành thực tập tốt và đạt kết quả cao.</p>` +
          `<p>Mọi thắc mắc hoặc các vấn đề về thông tin thực tập bạn có thể liên hệ với Thầy/Cô qua:</p>` +
          `<p> - Email: <b>${teacherEmail}</b></p>` +
          `<p> - Phone: <b>${teacherPhoneNumber}</b></p>` +
          `<h4><i>Trân trọng,</i></h4>` +
          `<h4><i>Sign: ${teacherName}</i></h4>` +
          `<h4><i>From: ${teacherEmail}</i></h4>`,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async sendRejectedMailToStudent(
    teacherEmail: string,
    teacherName: string,
    teacherPhoneNumber: string,
    studentEmail: string,
    studentName: string,
    academicYear: string,
    reason: string,
  ) {
    try {
      await this.mailerService.sendMail({
        from: teacherEmail,
        to: studentEmail,
        subject: 'Trả lời về đăng kí giảng viên hướng dẫn',
        context: {
          teacherEmail,
          teacherName,
          teacherPhoneNumber,
          studentEmail,
          studentName,
          academicYear,
          reason,
        },
        html:
          `<h3 style='color: #0194f3'>Xin chào bạn <b>${studentName}</b>,</h3>` +
          `<p>Thầy/Cô rất vui khi nhận được thông tin Đăng kí giảng viên hướng dẫn từ bạn.</p>` +
          `<p>Thầy/Cô rất tiếc vì <b>không thể</b> nhận làm Giảng viên hướng dẫn cho bạn trong năm học <b>${academicYear}</b> được.</p>` +
          `<p>Lý do: <b><i>${reason}</i></b>.</p>` +
          `<p>Chúc bạn sẽ chọn được giảng viên hướng dẫn khác phù hợp và hoàn thành thực tập thật tốt.</p>` +
          `<h4><i>Trân trọng,</i></h4>` +
          `<h4><i>Sign: ${teacherName}</i></h4>` +
          `<h4><i>From: ${teacherEmail}</i></h4>`,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async sendMailToTeacher(
    teacherEmail: string,
    teacherName: string,
    studentEmail: string,
    firstName: string,
    lastName: string,
    identityNumber: string,
    term: string,
    academicYear: string,
    Class: string,
    specialization: string,
  ) {
    try {
      await this.mailerService.sendMail({
        from: studentEmail,
        to: teacherEmail,
        subject: 'Đăng kí giảng viên hướng dẫn',
        context: {
          teacherEmail,
          teacherName,
          studentEmail,
          firstName,
          lastName,
          identityNumber,
          term,
          academicYear,
          Class,
          specialization,
        },
        html:
          `<h3 style='color: #0194f3'>Kính chào quý thầy/cô <b>${teacherName}</b></h3>` +
          `<p>Em xin giới thiệu</p>` +
          `<p> - Họ tên: <b>${lastName} ${firstName}</b></p>` +
          `<p> - Sinh viên <b>${term}</b> khóa học <b>${
            parseInt(academicYear) - 4
          }-${academicYear}</b></p>` +
          `<p> - Mã số sinh viên: <b>${identityNumber}</b></p>` +
          `<p> - Lớp: <b>${Class}</b></p>` +
          `<p> - Chuyên ngành: <b>${specialization}</b></p>` +
          `<p>Em gửi thư này xin đăng ký quý thầy/cô là <b>Giảng viên hướng dẫn</b> môn <b>Đồ án 2 (Thực tập tốt nghiệp)</b> năm học ${academicYear}.</p>` +
          `<p>Kính mong thầy/cô xem xét và chấp nhận,</p>` +
          `<p>Em xin chân thành cảm ơn quý thầy/cô</p>` +
          `<h4><i>Trân trọng,</i></h4>` +
          `<h4><i>${lastName} ${firstName}</i></h4>` +
          `<h4><i>From: ${studentEmail}</i></h4>`,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

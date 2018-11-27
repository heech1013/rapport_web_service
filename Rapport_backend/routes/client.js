/** join 이슈
 * 비밀번호 재확인 구현(클라이언트 단)
 * 이메일, 비밀번호 유효성 검사 필요(ts)
 * bcrypt 설치 오류(의존성 문제. 노드 버전 문제 때문인 것으로 추정)로 인해 bcrypt-nodejs 사용 
 * isLoggedIn, isNotLoggedIn 구현
 */
const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const nodemailer = require('nodemailer');

const { User } = require('../models');

const router = express.Router();

/* GET '/client/auth' : 일반 사용자 추가. 인증 이메일의 링크를 통해 접근 */
router.get('/auth', async (req, res, next) => {
  try {
    // 올바른 경로를 통해 접근했는지를 확인하기 위해 토큰 검정.
    const { email, token } = req.query;
    let result = await bcrypt.compareSync(process.env.EMAIL_TOKEN, token);  // boolean
    if (result) {  // 토큰 일치
      await User.update(
        { emailAuthentication: true },
        { where: { userType: 'client', email }}
      );
      return res.status(200).json({ joinAuth: true });
    } else {
      return res.status(401).json({ joinAuth: false });
    }
  } catch (error) {
    next(error);
  }
});

/* GET '/client' : 일반 사용자 모두 조회. 아직 필요 없음 */

/* POST '/client' : 회원가입(이메일 인증) */
router.post('/', async (req, res, next) => {
  try{  // 이메일, 닉네임 중복 검사
    
    // let { email, nick, phoneNumber, password } = req.body.client;  // req.body.client.email 형식으로 전달됨. 실제 테스트용
    let { email, nick, phoneNumber, password } = req.body;  // 나혼자 테스트 용
    let userType = 'client';

    let exEmail = await User.find({ where: { email }});
    if (exEmail) {
      return res.status(400).json({ emailOverlap: true });
    }
    let exNick = await User.find({ where: { nick }});
    if (exNick) {
      return res.status(400).json({ nickOverlap: true });
    }

    let hash = bcrypt.hashSync(password);
    await User.create({
      userType, email, nick, phoneNumber,
      password: hash
    });
  
    /* 이메일 전송 */
    let token = bcrypt.hashSync(process.env.EMAIL_TOKEN);  // 이메일 인증경로 검증을 위한 토큰 생성 (.env 인증코드 -> 암호화)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rapport5959@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });
    let mailOption = {
      from: "'라포' rapport5959@gmail.com",
      to: email,
      subject: '[라포] 이메일 인증링크가 도착하였습니다!',
      html: '<p>아래의 링크를 클릭하여 회원가입을 완료해주세요!<p>' + "<a href='http://localhost:3000/client/auth/?email=" + email + '&token=' + token + "'>회원가입 인증 완료하기</a>"
    }
    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        return res.status(500).json({ join: false });
      } else {  // 계정 생성 + 이메일 전송 성공
        return res.status(200).json({ join: true });  // info 옵션 다수(messageId, accepted, rejected, pending, response)
      }
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
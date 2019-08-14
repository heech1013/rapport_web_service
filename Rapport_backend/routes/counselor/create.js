require('dotenv').config();
const bcrypt = require('bcrypt');
const AWS = require('aws-sdk');
const formidable = require('formidable');
const fs = require('fs');

const validationResult = require('../../middlewares/validator/validationResult');
const phoneNumberValidator = require('../../middlewares/validator/phoneNumberValidator');
const overlapTester = require('../../middlewares/overlapTester/overlapTester');

const { User, CounselorField, CounselorLocation, CounselorProfile, Certification, Open } = require('../../models');

const create = async (req, res, next) => {
    try {
      const {
        email, phoneNumber, password,  // User
        name, address, price, career, simpleIntroduction, detailIntroduction,  // CounselorProfile
        family, relationship, personality, emotion, sexual, addiction, lifestyle, development, study  // CounselorField
      } = req.body;
      const userType = 'counselor';
      // counselor의 nick은 null

      await validationResult(req);
      await phoneNumberValidator(phoneNumber);
      await overlapTester('email', email);
  
      const hash = await bcrypt.hash(password, 10);

      const S3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'ap-northeast-2'
      });

      const form = new formidable.IncomingForm();

      const newUser = await User.create({  // create in association
        userType, email, phoneNumber, password: hash,
        CounselorProfile: { name, address, price, career, simpleIntroduction, detailIntroduction },
        CounselorField: { family, relationship, personality, emotion, sexual, addiction, lifestyle, development, study },
        CounselorLocation: {
          GS : false, YC : false, GR : false, YDP : false, DJ : false, GC : false, GA : false, SC : false, GN : false, SP : false, GD : false, MP : false,
          EP : false, SDM : false, JN : false, YS : false, SB : false, GB : false, DB : false, NW : false, JNg : false, DDM : false, SD : false, GJ : false, JG : false
        },
        Certification: { KCounselingPA_1: false, KCounselingPA_2: false, KClinicalPA: false },
        Open: {
          "startDate": null, "endDate": null,
          "MON0": false, "MON1": false, "MON2": false, "MON3": false, "MON4": false, "MON5": false, "MON6": false, "MON7": false, "MON8": false, "MON9": false, "MON10": false, "MON11": false, "MON12": false, "MON13": false, "MON14": false,"MON15": false,"MON16": false, "MON17": false, "MON18": false, "MON19": false, "MON20": false, "MON21": false, "MON22": false, "MON23": false,
          "TUE0": false, "TUE1": false, "TUE2": false, "TUE3": false, "TUE4": false, "TUE5": false, "TUE6": false, "TUE7": false, "TUE8": false, "TUE9": false, "TUE10": false, "TUE11": false, "TUE12": false, "TUE13": false, "TUE14": false,"TUE15": false,"TUE16": false, "TUE17": false, "TUE18": false, "TUE19": false, "TUE20": false, "TUE21": false, "TUE22": false, "TUE23": false,
          "WED0": false, "WED1": false, "WED2": false, "WED3": false, "WED4": false, "WED5": false, "WED6": false, "WED7": false, "WED8": false, "WED9": false, "WED10": false, "WED11": false, "WED12": false, "WED13": false, "WED14": false,"WED15": false,"WED16": false, "WED17": false, "WED18": false, "WED19": false, "WED20": false, "WED21": false, "WED22": false, "WED23": false,
          "THU0": false, "THU1": false, "THU2": false, "THU3": false, "THU4": false, "THU5": false, "THU6": false, "THU7": false, "THU8": false, "THU9": false, "THU10": false, "THU11": false, "THU12": false, "THU13": false, "THU14": false,"THU15": false,"THU16": false, "THU17": false, "THU18": false, "THU19": false, "THU20": false, "THU21": false, "THU22": false, "THU23": false,
          "FRI0": false, "FRI1": false, "FRI2": false, "FRI3": false, "FRI4": false, "FRI5": false, "FRI6": false, "FRI7": false, "FRI8": false, "FRI9": false, "FRI10": false, "FRI11": false, "FRI12": false, "FRI13": false, "FRI14": false,"FRI15": false,"FRI16": false, "FRI17": false, "FRI18": false, "FRI19": false, "FRI20": false, "FRI21": false, "FRI22": false, "FRI23": false,
          "SAT0": false, "SAT1": false, "SAT2": false, "SAT3": false, "SAT4": false, "SAT5": false, "SAT6": false, "SAT7": false, "SAT8": false, "SAT9": false, "SAT10": false, "SAT11": false, "SAT12": false, "SAT13": false, "SAT14": false,"SAT15": false,"SAT16": false, "SAT17": false, "SAT18": false, "SAT19": false, "SAT20": false, "SAT21": false, "SAT22": false, "SAT23": false,
          "SUN0": false, "SUN1": false, "SUN2": false, "SUN3": false, "SUN4": false, "SUN5": false, "SUN6": false, "SUN7": false, "SUN8": false, "SUN9": false, "SUN10": false, "SUN11": false, "SUN12": false, "SUN13": false, "SUN14": false,"SUN15": false,"SUN16": false, "SUN17": false, "SUN18": false, "SUN19": false, "SUN20": false, "SUN21": false, "SUN22": false, "SUN23": false
        }
      },{
        include: [
          { model: CounselorProfile, as: 'CounselorProfile' },
          { model: CounselorField, as: 'CounselorField' },
          { model: CounselorLocation, as: 'CounselorLocation' },
          { model: Certification, as: 'Certification' },
          { model: Open, as: 'Open' }
        ]
      });
      
      /* 업로드한 파일을 formidable을 사용하여 임시 경로에 저장한다. */
      form.parse(req, (err, fields, files) => {  // files: 사용자가 업로드한 파일의 정보
        const paramsForProfile = {
          Bucket: 'rapport-img',  // S3 bucket 설정
          Key: `${newUser.id}/프로필`, // S3에 저장될 파일 이름 설정
          ACL: 'public-read',  // 접근 권한. public-read여야 웹에서 이미지로 접근 가능
          Body: fs.createReadStream(files.profileImg.path),  // files(업로드 파일 정보).input_file(<form>의 <input>의 지정한 name 명).path(해당 파일이 저장된 임시 경로)
          ContentType: 'image/jpg'  // 웹에서 이미지를 로드했을 때 자동으로 파일이 다운로드 되는 것을 방지한다.
        }
        /* 임시경로에 저장된 프로필 파일을 S3에 업로드한다. */
        // size가 0이어도(파일을 제출하지 않아도) s3에 저장이 되며 src가 할당된다.
        S3.upload(paramsForProfile, (err, data) => {
          if (err) {
            return next(err);
          } else {
            console.log('S3 Upload Success. img_src: ', data.Location);
            /* 업로드한 프로필 사진의 src를 해당 유저의 DB에 업데이트한다. */
            CounselorProfile.update({ profileImgSrc: data.Location }, { where: { fkCounselorId: newUser.id }});
          }
        });
        /* 임시경로에 저장된 파일을 삭제한다. */
        fs.unlink(files.profileImg.path, (err) => {
          if (err) {
            next(err);
          } else {
            console.log('Temp Files Delete Success. temparary file path: ', files.profileImg.path);
          }
        });
      });

      // 계정 생성
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

module.exports = create;
module.exports = (sequelize, DataTypes) => {
  const CounselorProfile = sequelize.define('counselorProfile', {

    // id: 자동생성
    
    // fkCounselorId: User 스키마의 상담사 id를 foreign key로 가짐.

    name: {  // 상담사 이름
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: false,
    },
    address: {  // 개인 상담사의 개인공간 주소
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    price: {  // 상담 비용
      type: DataTypes.TINYINT,
      allowNull: true,
    },
    career: {  // 경력 & 연혁
      type: DataTypes.TEXT,  // MVP 단계에서는 상담사가 알아서 짝대기 엔터를 이용하여 경력을 보기 좋게 작성하는 걸로 합의.
      allowNull: true,
    },
    simpleIntroduction: {  // 한 줄 인사
      type: DataTypes.TEXT,
      allowNull: true,
    },
    detailIntroduction: {  // 소개 & 특이사항
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // updatedAt : 자동 생성

    // createdAt : 자동 생성

  }, {
    timestamps: true,  // updatedAt, createdAt 자동 생성
    underscored: false,  // camelCase style(updatedAt, createdAt)
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });

  return CounselorProfile;
};
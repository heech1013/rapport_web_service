const { Open } = require('../../../models');

const update = async (req, res, next) => {
  try {
    /*
      req.body.counselorId = '45',
      req.body.open = {
        startDate: '2019-01-28',
        endDate: '2019-05-01',
        MON9: true,
        MON10: true,
        ...
        SUN18: false
      }
    */
    const { counselorId, open } = req.body;
    Open.update(
      { ...open },
      { where: { fkCounselorId: counselorId }}
    );

    return res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = update;

/*
  새로 오픈하는 것은 문제가 되지 않지만, 기존에
  오픈되어 있던 요일/시간의 상담종료일("endDate")를 앞당기
  려는 경우, 앞당기려는 상담종료일과 기존의 상담종료일 사이
  에 이미 예약되어 있는 상담이 있을 수 있다. 이는
  그대로 예약되어 진행될 상담케이스로 냅두고, 그 외의 시간
  만 닫으면 된다. 다만 이를 상담사에게 알려줄 필요가 있
  다. (예를 들어, "상담 종료일을 앞당겨도 기존에 이미 예약된
  상담 케이스는 그대로 유지되며, 나머지 요일/시간은 닫히게 
  됩니다" 이런 식으로.)
*/
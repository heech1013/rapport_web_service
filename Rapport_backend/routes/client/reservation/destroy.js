const validationResult = require('../../../middlewares/validator/validationResult');
// const dateValidator = require('../../../middlewares/validator/dateValidator');
const dateRangeValidator = require('../../../middlewares/validator/dateRange');
const sessionArrayMaker = require('../../../middlewares/dateMaker/sessionArray');
const CustomError = require('../../../middlewares/errorHandler/customError');

const { Sequelize, Reservation } = require('../../../models');

const { Op } = Sequelize;

const destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { clientId } = req.body;  // session 추가

    await validationResult(req);  // 수정 필요 (뭐 검사하는지)

    const RsvPrototype = await Reservation.findOne({
      where: {
        id,
        fkClientId: clientId,
      }
    });

    if (RsvPrototype.length === 0) {
      return next(CustomError('BadRequest', 'Reservation do not exist.'))
    } 
    else if (RsvPrototype.confirmation) {
      return next(CustomError('BadRequest', 'Reservation is already confirmed.'))
    }
    
    await dateRangeValidator('future', RsvPrototype.date);

    const sessionArr = await sessionArrayMaker(RsvPrototype.date, RsvPrototype.session);
    await Reservation.destroy({
      where: {
        date: {
          [Op.in] : sessionArr
        },
        fkClientId: clientId
      }
    });

    return res.status(204).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = destroy;
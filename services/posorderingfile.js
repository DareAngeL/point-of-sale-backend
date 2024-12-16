const { Op } = require("sequelize");

const fixNoOrdocnum = async (posorderingfile, posfile) => {
    // find all the null ordocnum
    const nulls = (await posorderingfile.ReadMany({where: {ordocnum: null}, raw: true})).rows;

    // check every nulls if it's a duplicate one.
    // if it's a duplicate, delete it , if not, do not delete it cuz it's not covered for this fixation.
    let fixed = 0;
    await Promise.all(nulls.map(async elem => {
        const dupl = await posorderingfile.GetInstance().findOne({
            where: {
                itmcde: elem.itmcde,
                ordercde: elem.ordercde,
                ordocnum: {
                    [Op.not]: null
                },
            }
        });

        if (dupl) {
            await posorderingfile.GetInstance().destroy({
                where: {
                    ordocnum: null,
                    itmcde: elem.itmcde,
                    ordercde: elem.ordercde
                }
            });
            fixed++;
            return;
        }

        // if it has no duplicate then check the posfile table if it exist there, 
        // if it didn't exist there, it means it shouldn't exist in posorderingfile also.
        const posfileExists = await posfile.GetInstance().findOne({
            where: {
                itmcde: elem.itmcde,
                ordercde: elem.ordercde
            }
        });

        // if it exists in posfile table, then just add the ordocnum
        if (posfileExists) {
            await posorderingfile.Update({ 
                ordocnum: null,
                itmcde: elem.itmcde,
                ordercde: elem.ordercde
            }, { ordocnum: posfileExists.ordocnum });
            fixed++;
        }
        // else delete it in posorderingfile table
        else {
            await posorderingfile.GetInstance().destroy({
                where: {
                    ordocnum: null,
                    itmcde: elem.itmcde,
                    ordercde: elem.ordercde
                }
            });
            fixed++;
        }
    }));

    if (fixed > 0) {
        return true;
    }
    else {
        return false;
    }
}

module.exports = {fixNoOrdocnum}
const createConnection = require('../db');
const { SqlError, InvalidRequestError } = require('../utils/errors');
const { getOnePerson } = require('./personsService')

const getOneCertificate = async(year, number, name, surname, patronymic) => {
    try {
        const client = createConnection();
        const result = await client.query(`SELECT certificate_id, start_date, end_date, number, year_graduation, comission_number, position FROM certificates WHERE person_fk in (SELECT person_id FROM persons WHERE name = '${name}' AND patronymic = '${patronymic}' AND surname = '${surname}')  AND number = '${number}' AND year_graduation='${year}'`)
        client.end();
        return result.rows[0];
    } catch (err) {
        throw new SqlError(err.message)
    }
}

const createOneCertificate = async({ year_graduation, number, position, comission_number, name, surname, patronymic, start_date, end_date, p_series, p_number }) => {
    try {
        let person_id = await getOnePerson({ name, surname, patronymic, p_series, p_number })
        if (!person_id) {
            throw new InvalidRequestError("Помилка. Дані про задану особу відсутні.")
        }
        const client = createConnection();
        const result1 = await client.query(`SELECT * FROM certificates WHERE number = '${number}'`)
        if (result1.rows[0] != undefined) {
            throw new InvalidRequestError("Сертифікат з таким номером уже існує")
        }
        const result = await client.query(`INSERT into certificates (year_graduation, number, position, comission_number, person_fk, start_date, end_date) VALUES ('${year_graduation}', '${number}', '${position}', '${comission_number}', ${person_id.person_id}, '${start_date}', '${end_date}')  RETURNING certificate_id`)
        client.end();
        return result.rows[0].certificate_id
    } catch (err) {
        throw new SqlError(err.message)
    }
}

const updateOneCertificate = async({ certificate_id, year_graduation, number, position, comission_number, start_date, end_date }) => {
    try {
        const client = createConnection();
        const result = await client.query(`SELECT * FROM certificates WHERE number = '${number}'`)
        if (result.rows[0] != undefined) {
            if (result.rows[0].certificate_id !== certificate_id) {
                throw new InvalidRequestError("Сертифікат з таким номером уже існує")
            }
        }
        await client.query(`UPDATE certificates SET year_graduation = '${year_graduation}', number = '${number}', position = '${position}' , start_date = '${start_date}', end_date = '${end_date}', comission_number = '${comission_number}' where certificate_id = ${certificate_id}`)
        client.end();
    } catch (err) {
        throw new SqlError(err.message)
    }
}

module.exports = { getOneCertificate, createOneCertificate, updateOneCertificate };
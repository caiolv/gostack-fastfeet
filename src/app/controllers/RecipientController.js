import * as Yup from 'yup';
import { Op } from 'sequelize';

import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const { page = 1, search = '' } = req.query;
    const perPage = 5;

    const recipients = await Recipient.findAll({
      where: {
        name: { [Op.like]: `%${search}%` },
      },
      attributes: [
        'id',
        'name',
        'street',
        'number',
        'complement',
        'state',
        'city',
        'cep',
      ],
      order: ['id'],
      limit: perPage,
      offset: (page - 1) * perPage,
    });

    return res.json(recipients);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      cep: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { cep } = req.body;

    const recipient = await Recipient.findOne({ where: { cep } });

    if (recipient) {
      return res.status(400).json({ error: 'Recipient already exists.' });
    }

    const {
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
    } = await Recipient.create(req.body);

    return res.json({
      user: {
        id,
        name,
        cep,
        street,
        number,
        complement,
        state,
        city,
      },
    });
  }

  async update(req, res) {
    const { id } = req.params;

    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      cep: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { cep: newCep } = req.body;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient doens`t exists.' });
    }

    if (newCep && newCep !== recipient.cep) {
      const existsRecipient = await Recipient.findOne({
        where: { cep: newCep },
      });

      if (existsRecipient) {
        return res
          .status(400)
          .json({ error: 'Recipient with this cep already exists.' });
      }
    }

    const {
      name,
      street,
      number,
      complement,
      state,
      city,
    } = await recipient.update(req.body);

    return res.json({
      user: {
        id,
        name,
        cep: newCep,
        street,
        number,
        complement,
        state,
        city,
      },
    });
  }

  async show(req, res) {
    const { id } = req.params;
    const courier = await Recipient.findByPk(id, {
      attributes: [
        'id',
        'name',
        'street',
        'number',
        'complement',
        'state',
        'city',
        'cep',
      ],
    });

    if (!courier) {
      return res.status(400).json({ error: 'Recipient does not exist. ' });
    }

    return res.json(courier);
  }
}

export default new RecipientController();

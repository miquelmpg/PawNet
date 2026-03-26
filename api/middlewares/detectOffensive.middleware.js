import fs from 'fs';
import { createRequire } from 'module';
import createError from 'http-errors';

const require = createRequire(import.meta.url);
const Filter = require('bad-words');

const spanishWords = require('../dictionaries/es.json');

const filter = new Filter();

filter.addWords(...spanishWords);

export function detectOffensive(req, res, next) {
  try {
    const text = req.body.content;
    if (!text) return next(createError(400, "Text not found"));

    if (filter.isProfane(text)) {
      return next(createError(403, "Offensive text detected"));
    }

    next();
  } catch (err) {
    next(err);
  }
}
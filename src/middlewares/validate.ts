import express from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * バリデーションするためのミドルウェア
 * @param validation ValidationChain
 * @param callback 成功後に実行する関数
 */
export const validate = (validations: ValidationChain[], callback) => {
  return async (req: express.Request, res: express.Response) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return callback(req, res);
    }

    res.status(400).json({ errors: errors.array() });
  };
};

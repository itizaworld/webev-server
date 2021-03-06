import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import { escapeRegExp } from 'lodash';

import { FindPagesByUserIdUseCase } from '~/application/useCases/page';
import { Page } from '~/domain/Page';
import { PaginationOptions } from '~/domain/shared';
import { User } from '~/domain/User';
import { PageRepository } from '~/infrastructure/repositories/PageRepository';

const findPagesByUserIdUseCase = new FindPagesByUserIdUseCase(
  new PageRepository(),
);

/**
 * @swagger
 * /api/v1/pages/list:
 *   get:
 *     description: ユーザーに紐付いたページを取得する
 *     parameters:
 *      - name: userId
 *        in: query
 *        description: userId
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: 検索条件にあったページを返す
 *         schema:
 *           type: object
 *           properties:
 *             pages:
 *               $ref: '#/definitions/Page'
 */
export const findPages = async (
  req: Request<{ isRead: 'true' | 'false' }> & { user: User },
  res: Response,
) => {
  const { sort, page = '1', limit = '10', q = '', isRead } = req.query;

  if (
    typeof q !== 'string' ||
    typeof page !== 'string' ||
    typeof limit !== 'string' ||
    typeof sort !== 'string'
  ) {
    return res.status(400).json({ message: 'urlはstringである必要があります' });
  }

  const query: FilterQuery<Page> = {
    createdUser: req.user.id,
    isDeleted: false,
  };

  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  if (q) {
    const safeQuery = escapeRegExp(q);
    query.$or = [
      { url: new RegExp(safeQuery) },
      { title: new RegExp(safeQuery) },
      { siteName: new RegExp(safeQuery) },
      { description: new RegExp(safeQuery) },
    ];
  }

  const options = new PaginationOptions({
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
  });

  try {
    const paginationPage = await findPagesByUserIdUseCase.execute(
      query,
      options,
    );
    return res.status(200).json({ paginationPage });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

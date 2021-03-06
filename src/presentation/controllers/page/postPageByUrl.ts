import { Request, Response } from 'express';
import { body } from 'express-validator';
import { PostPageByUrlUseCase } from '~/application/useCases/page';
import { User } from '~/domain/User';
import { OgpAdapter } from '~/infrastructure/adapters/ogp.adapter';
import { PageRepository } from '~/infrastructure/repositories/PageRepository';
import { validate } from '~/presentation/middlewares/validate';
import { isValidUrl } from '~/utils/isValidUrl';
import { logger } from '~/utils/logger';

const validations = [body('url').custom((url) => isValidUrl(url))];
const postPageByUrlUseCase = new PostPageByUrlUseCase(
  new OgpAdapter(),
  new PageRepository(),
);

/**
 * @swagger
 * /api/v1/pages:
 *   post:
 *     description: UrlからOGPを取得して保存するためのapi
 *     parameters:
 *      - name: url
 *        in: body
 *        description: 保存するurl
 *        required: true
 *        type: string
 *        example: https://github.com/itizaworld/webev
 *     responses:
 *       200:
 *         description: 新規作成したページを返す
 *         schema:
 *           type: object
 *           properties:
 *             currentUser:
 *               $ref: '#/definitions/Page'
 */
export const postPageByUrl = validate(
  validations,
  async (req: Request & { user: User }, res: Response) => {
    const { url } = req.body;

    if (typeof url !== 'string') {
      return res
        .status(400)
        .json({ message: 'urlはstringである必要があります' });
    }

    try {
      const page = await postPageByUrlUseCase.execute({
        url,
        userId: req.user.id,
      });
      return res.status(200).json({ page });
    } catch (error) {
      logger(error, 'error');
      return res.status(500).json({ message: error.message });
    }
  },
);

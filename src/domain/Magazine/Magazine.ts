import { ObjectId } from 'mongodb';

export class Magazine {
  id: string;
  name: string;
  description?: string;
  isDeleted: boolean;
  isPublic: boolean;
  createdUserId: string;
  createdAt: Date;
  updatedAt: Date;
  constructor(init: Magazine) {
    this.id = init.id;
    this.name = init.name;
    this.description = init.description;
    this.isDeleted = init.isDeleted;
    this.isPublic = init.isPublic;
    this.createdUserId = init.createdUserId;
    this.createdAt = init.createdAt;
    this.updatedAt = init.updatedAt;
  }

  public static create(
    params: Omit<
      Magazine,
      'id' | 'isDeleted' | 'isPublic' | 'createdAt' | 'updatedAt'
    >,
  ) {
    return new Magazine({
      // 本来生成する場所はdomainに書くべきではない
      id: new ObjectId().toString(),
      name: params.name,
      description: params.description,
      isDeleted: false,
      isPublic: false,
      createdUserId: params.createdUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Image } from '../images/entities/image.entity';
import { Product } from '../product/entities/product.entity';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchResolver } from './search.resolver';
import { SearchService } from './search.service';
import { ProductService } from '../product/product.service';
import { ProductDetail } from '../productDetail/entities/productDetail.entity';
import { ProductDetailService } from '../productDetail/productDetail.service';
import { Point } from '../points/entities/point.entity';
import { PointsService } from '../points/points.service';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, //
      Image,
      Product,
      ProductDetail,
      Point,
      Order,
    ]),
    ElasticsearchModule.register({
      node:
        process.env.DEPLOY_ENV === 'LOCAL'
          ? `${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`
          : `http://elastic.brian-hong.tech:9200`,
    }),
  ],
  providers: [
    SearchResolver,
    SearchService,
    UsersService,
    ProductService,
    ProductDetailService,
    PointsService,
  ],
})
export class SearchModule {}

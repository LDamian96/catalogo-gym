import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CatalogService } from './catalog.service';
import {
  catalogCategoryQuerySchema,
  CatalogCategoryQueryDto,
  CatalogCategoryQueryDtoClass,
  catalogSearchQuerySchema,
  CatalogSearchQueryDto,
  CatalogSearchQueryDtoClass,
  trackEventSchema,
  TrackEventDto,
  TrackEventDtoClass,
} from './dto';

@ApiTags('Catalog (Public)')
@Controller('catalog')
@Public() // All endpoints in this controller are public
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({
    summary: 'Get catalog home data',
    description: 'Returns settings, active categories, featured products, and brands',
  })
  async getCatalogHome() {
    return this.catalogService.getCatalogHome();
  }

  @Get('products/:slug')
  @ApiOperation({
    summary: 'Get product by slug',
    description: 'Returns product details with variants and related products',
  })
  @ApiParam({ name: 'slug', description: 'Product slug', example: 'zapatilla-nike-air' })
  async getProductBySlug(@Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }

  @Get('categories/:slug')
  @ApiOperation({
    summary: 'Get products by category',
    description: 'Returns category info with paginated products and filters',
  })
  @ApiParam({ name: 'slug', description: 'Category slug', example: 'zapatillas' })
  @ApiQuery({ type: CatalogCategoryQueryDtoClass })
  async getProductsByCategory(
    @Param('slug') slug: string,
    @Query(new ZodValidationPipe(catalogCategoryQuerySchema)) query: CatalogCategoryQueryDto,
  ) {
    return this.catalogService.getProductsByCategory(slug, query);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search products',
    description: 'Search products by name, description, or slug',
  })
  @ApiQuery({ type: CatalogSearchQueryDtoClass })
  async searchProducts(
    @Query(new ZodValidationPipe(catalogSearchQuerySchema)) query: CatalogSearchQueryDto,
  ) {
    return this.catalogService.searchProducts(query);
  }

  @Post('track')
  @ApiOperation({
    summary: 'Track event',
    description: 'Track user events (views, clicks, etc.)',
  })
  @ApiBody({ type: TrackEventDtoClass })
  async trackEvent(
    @Body(new ZodValidationPipe(trackEventSchema)) dto: TrackEventDto,
  ) {
    return this.catalogService.trackEvent(dto);
  }
}

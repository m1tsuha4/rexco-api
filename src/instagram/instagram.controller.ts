import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { CreateInstagramDto, CreateInstagramSchema } from './dto/create-instagram.dto';
import { UpdateInstagramDto, UpdateInstagramSchema } from './dto/update-instagram.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-guard.auth';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'This Is Title' },
        link: { type: 'string', example: 'https://www.instagram.com/p/' },
      },
    },
  })
  @Post()
  create(@Body(new ZodValidationPipe(CreateInstagramSchema)) createInstagramDto: CreateInstagramDto) {
    return this.instagramService.create(createInstagramDto);
  }

  @Get()
  findAll() {
    return this.instagramService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instagramService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'This Is Title' },
        link: { type: 'string', example: 'https://www.instagram.com/p/' },
      },
    },
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateInstagramSchema)) updateInstagramDto: UpdateInstagramDto) {
    return this.instagramService.update(id, updateInstagramDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instagramService.remove(id);
  }
}

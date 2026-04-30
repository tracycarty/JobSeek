import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from './job.entity.js';
import { JobsService } from './jobs.service.js';

const mockJob = {
  id: 1,
  title: 'Software Developer',
  company: 'Tech Corp',
  location: 'Cagayan de Oro',
  salary: 'PHP 30,000',
  description: 'Build software.',
  created_at: new Date('2026-04-30T12:00:00.000Z'),
} as Job;

describe('JobsService', () => {
  let service: JobsService;
  const repository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: repository,
        },
      ],
    }).compile();

    service = moduleRef.get(JobsService);
    jest.clearAllMocks();
  });

  it('returns paginated jobs', async () => {
    repository.findAndCount.mockResolvedValue([[mockJob], 1]);

    await expect(service.findAll({ page: '1', limit: '10' })).resolves.toEqual({
      data: [mockJob],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it('uses defaults for invalid pagination values', async () => {
    repository.findAndCount.mockResolvedValue([[], 0]);

    await expect(
      service.findAll({ page: '-1', limit: 'abc' }),
    ).resolves.toEqual({
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });
  });

  it('throws 404 when a job is not found', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(404)).rejects.toThrow(NotFoundException);
  });
});

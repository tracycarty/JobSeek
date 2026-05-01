"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_entity_js_1 = require("./job.entity.js");
let JobsService = class JobsService {
    jobsRepository;
    constructor(jobsRepository) {
        this.jobsRepository = jobsRepository;
    }
    async findAll(query) {
        const { page, limit, skip } = this.normalizePagination(query);
        const [jobs, total] = await this.jobsRepository.findAndCount({
            select: {
                id: true,
                title: true,
                company: true,
                location: true,
                salary: true,
            },
            order: { created_at: "DESC", id: "DESC" },
            skip,
            take: limit,
        });
        return this.paginatedResponse(jobs, page, limit, total);
    }
    async search(q, query) {
        const { page, limit, skip } = this.normalizePagination(query);
        const keyword = `%${this.escapeLike(q.trim())}%`;
        const searchQuery = this.jobsRepository
            .createQueryBuilder("job")
            .select([
            "job.id",
            "job.title",
            "job.company",
            "job.location",
            "job.salary",
        ])
            .where(new typeorm_2.Brackets((qb) => {
            qb.where("job.title LIKE :keyword ESCAPE '\\\\'", { keyword })
                .orWhere("job.company LIKE :keyword ESCAPE '\\\\'", { keyword })
                .orWhere("job.location LIKE :keyword ESCAPE '\\\\'", { keyword });
        }))
            .orderBy("job.created_at", "DESC")
            .addOrderBy("job.id", "DESC")
            .skip(skip)
            .take(limit);
        const [jobs, total] = await searchQuery.getManyAndCount();
        return this.paginatedResponse(jobs, page, limit, total);
    }
    async findOne(id) {
        const job = await this.jobsRepository.findOne({ where: { id } });
        if (!job) {
            throw new common_1.NotFoundException("Job not found");
        }
        return job;
    }
    normalizePagination(query) {
        const page = this.toPositiveInteger(query.page, 1);
        const limit = this.toPositiveInteger(query.limit, 10);
        const skip = (page - 1) * limit;
        return { page, limit, skip };
    }
    toPositiveInteger(value, fallback) {
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < 1) {
            return fallback;
        }
        return parsed;
    }
    escapeLike(value) {
        return value.replace(/[\\%_]/g, "\\$&");
    }
    paginatedResponse(jobs, page, limit, total) {
        return {
            data: jobs,
            pagination: {
                page,
                limit,
                total,
                totalPages: total === 0 ? 0 : Math.ceil(total / limit),
            },
        };
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_js_1.Job)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], JobsService);
//# sourceMappingURL=jobs.service.js.map
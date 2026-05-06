import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';

describe('JobsController', () => {
  const jobsService = {
    findAll: jest.fn(),
    search: jest.fn(),
    findOne: jest.fn(),
  } as unknown as JobsService;

  let controller: JobsController;

  beforeEach(() => {
    controller = new JobsController(jobsService);
    jest.clearAllMocks();
  });

  it('redirects browser visits to the jobs UI', () => {
    const response = {
      redirect: jest.fn(),
    };

    const result = controller.findAll(
      {},
      'text/html,application/xhtml+xml',
      response as never,
    );

    expect(result).toBeUndefined();
    expect(response.redirect).toHaveBeenCalledWith('/applicants/jobs.html');
    expect(jobsService.findAll).not.toHaveBeenCalled();
  });

  it('returns JSON data for API requests', () => {
    const response = {
      redirect: jest.fn(),
    };

    controller.findAll({}, 'application/json', response as never);

    expect(jobsService.findAll).toHaveBeenCalledWith({});
    expect(response.redirect).not.toHaveBeenCalled();
  });
});

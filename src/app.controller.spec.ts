import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController({} as AppService);
  });

  it('redirects the root route to the login page', () => {
    const response = {
      redirect: jest.fn(),
    };

    const result = controller.redirectRoot(response as never);

    expect(result).toBeUndefined();
    expect(response.redirect).toHaveBeenCalledWith('/login.html');
  });
});

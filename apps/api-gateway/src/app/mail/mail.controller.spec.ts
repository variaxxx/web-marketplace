import { MicroserviceName } from "../../../../../libs/shared/src";
import { MailController } from "./mail.controller";
import { ClientProxy } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";

function mockResponse() {
  const res: any = {};
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
}

function mockRequest(cookies = {}, userAgent = "Mozilla/5.0") {
  return {
    cookies,
    headers: { "user-agent": userAgent },
  };
}

describe("mailController", () => {
  let controller: MailController;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        {
          provide: MicroserviceName.MAIL_SERVICE,
          useValue: {
            send: jest.fn(),
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MailController>(MailController);
    clientProxy = module.get<ClientProxy>(MicroserviceName.MAIL_SERVICE);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});

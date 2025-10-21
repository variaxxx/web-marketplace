import { MailController } from "./mail.controller";
import { Test, TestingModule } from "@nestjs/testing";

describe("mailController", () => {
  let controller: MailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
    }).compile();

    controller = module.get<MailController>(MailController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});

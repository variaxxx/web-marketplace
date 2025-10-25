import { AppService } from "./app.service";
import { Test } from "@nestjs/testing";

describe("appService", () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe("getData", () => {
    it("should return \"Hello API\"", () => {
      expect(service.getData()).toEqual({ message: "Hello API" });
    });
  });
});

import { Injectable } from "@nestjs/common";
import { compile, TemplateDelegate } from "handlebars";
import { readFileSync } from "node:fs";
import { join } from "node:path";

@Injectable()
export class TemplateService {
  private cache = new Map<string, TemplateDelegate>();

  public async render(templateName: string, ctx?: Record<string, any>): Promise<string> {
    if (!this.cache.get(templateName)) {
      const path = join(
        process.cwd(),
        "apps/notification/src/infra/mail/templates",
        `${templateName}.hbs`,
      );

      const file = readFileSync(path, "utf-8");

      this.cache.set(templateName, compile(file));
    }

    const template = this.cache.get(templateName);

    return template!(ctx);
  };
}

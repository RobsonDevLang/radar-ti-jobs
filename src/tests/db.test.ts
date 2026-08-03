import { describe, expect, it } from "vitest";

import { contentHash, contentHashInput, normalizeText, parseList } from "@/lib/db/normalize";

describe("normalizeText", () => {
  it("remove acentos, caixa e espaços extras", () => {
    expect(normalizeText("  Analista  de  Sistemas Público ")).toBe("analista de sistemas publico");
    expect(normalizeText(undefined)).toBe("");
  });
});

describe("parseList", () => {
  it("aceita vírgulas, ponto e vírgula e quebras de linha", () => {
    expect(parseList("Porto Alegre, Canoas\nViamão; ")).toEqual([
      "Porto Alegre",
      "Canoas",
      "Viamão",
    ]);
  });
});

describe("contentHash", () => {
  it("gera a mesma chave para o mesmo concurso vindo de sites diferentes", async () => {
    const a = { sourceId: "pci-1", organization: "Prefeitura", role: "Analista", city: "Porto Alegre", state: "RS", vacancies: 2, title: "x" };
    const b = { sourceId: "jc-9", organization: "PREFEITURA", role: "ANALISTA", city: "porto alegre", state: "rs", vacancies: 2, title: "y" };
    expect(contentHashInput(a)).toBe(contentHashInput(b));
    expect(await contentHash(a)).toBe(await contentHash(b));
  });

  it("muda quando um campo identificador muda", async () => {
    const base = { sourceId: "1", organization: "Prefeitura", role: "Analista", city: "Porto Alegre" };
    expect(await contentHash(base)).not.toBe(await contentHash({ ...base, city: "Canoas" }));
  });

  it("produz hash SHA-256 em hexadecimal", async () => {
    expect(await contentHash({ sourceId: "1", title: "t" })).toMatch(/^[0-9a-f]{64}$/);
  });
});

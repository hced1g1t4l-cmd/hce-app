// Configuração da emissão de NFS-e (BAC_144, Fase 4). DESLIGADA por padrão:
// só liga quando ASAAS_NFSE_ENABLED=true E o código de serviço estiver definido.
//
// Os PARÂMETROS FISCAIS (código de serviço municipal, alíquota de ISS, se é
// retido, descrição) são decisão do contador e vêm por variável de ambiente —
// nunca chumbados no código. A configuração da CONTA (certificado A1, inscrição
// municipal, regime) é feita no painel do Asaas, não aqui.
//
// Município da HCE (Rio de Janeiro/RJ) exige Certificado Digital A1 e usa o
// "código de serviço municipal" direto (não o item da lista LC 116).

export type NfseConfig = {
  enabled: boolean;
  serviceCode: string; // código de serviço municipal (ex.: "07.01.01")
  serviceName: string; // descrição do serviço na nota
  observations: string; // observações (ex.: NBS, texto livre)
  deductions: number; // deduções em reais (normalmente 0)
  iss: number; // alíquota de ISS em % (ex.: 2)
  retainIss: boolean; // ISS retido pelo tomador?
};

function num(v: string | undefined, fallback: number): number {
  const n = Number((v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

export function nfseConfig(): NfseConfig {
  return {
    enabled: process.env.ASAAS_NFSE_ENABLED === "true",
    serviceCode: (process.env.ASAAS_NFSE_SERVICE_CODE ?? "").trim(),
    serviceName:
      process.env.ASAAS_NFSE_SERVICE_NAME?.trim() ||
      "Assinatura Clube +HCE — conteúdo digital de gastronomia",
    observations: process.env.ASAAS_NFSE_OBSERVACOES?.trim() || "",
    deductions: num(process.env.ASAAS_NFSE_DEDUCOES, 0),
    iss: num(process.env.ASAAS_NFSE_ISS_PERCENT, 0),
    retainIss: process.env.ASAAS_NFSE_ISS_RETIDO === "true",
  };
}

/**
 * True quando a emissão automática deve rodar: flag ligada E código de serviço
 * informado. Enquanto o contador não fechar os dados, fica false e nada é
 * emitido (o checkout e o webhook simplesmente pulam a parte de nota).
 */
export function nfseHabilitado(): boolean {
  const c = nfseConfig();
  return c.enabled && c.serviceCode.length > 0;
}

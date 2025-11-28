import * as XLSX from "xlsx";

export function exportAssetsToExcel(assets: any[]) {
  // Converter lista de objetos → planilha
  const worksheet = XLSX.utils.json_to_sheet(assets);

  // Criar workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Patrimonios");

  // Gerar arquivo
  XLSX.writeFile(workbook, "patrimonios.xlsx");
}


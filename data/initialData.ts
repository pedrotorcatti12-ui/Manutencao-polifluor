

import { SparePart, TaskDetail } from '../types';

export const rawEquipmentData = [
    // --- MÁQUINAS INDUSTRIAIS (Mantidos) ---
    { identificacao: 'PH-15', descricao: 'PRENSA HIDRÁULICA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-', isKey: true },
    { identificacao: 'CF-01', descricao: 'CÂMARA FRIA', localizacao: 'EXTRUSÃO', status: 'Ativo', fabricante: 'ENGE FRIL', modelo: '-', ano: '-' },
    { identificacao: 'TB-01', descricao: 'TAMBOREADOR', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'GV MÁQUINA', modelo: '-', ano: '-' },
    { identificacao: 'FO-10', descricao: 'FORNO', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-', isKey: true },
    { identificacao: 'TA-01', descricao: 'TORNO AUTOMÁTICO', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'TRAUB', modelo: 'A15125', ano: '-' },
    { identificacao: 'TA-02', descricao: 'TORNO AUTOMÁTICO', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'TRAUB', modelo: 'A15125', ano: '-' },
    { identificacao: 'AF-01', descricao: 'AUTOFRETAGEM', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'FO-09', descricao: 'FORNO ELÉTRICO', localizacao: '-', status: 'Ativo', fabricante: 'REVEST ARC', modelo: 'VC-091148', ano: '-' },
    { identificacao: 'TD-02', descricao: 'TRANÇADEIRA', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: 'NADOLSKY', modelo: '-', ano: '-', isKey: true },
    { identificacao: 'FO-11', descricao: 'FORNO', localizacao: '-', status: 'Ativo', fabricante: 'STANDARD', modelo: 'SET', ano: '2002', isKey: true },
    { identificacao: 'FO-12', descricao: 'FORNO', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TRID-01', descricao: 'TRIDIMENSIONAL', localizacao: 'SALA QUALIDADE', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TF-01', descricao: 'TREFILA', localizacao: 'TREFILA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'ES-01', descricao: 'ESMERIL', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'SF-03', descricao: 'SERRA DE FITA', localizacao: '-', status: 'Ativo', fabricante: 'RONEMAK', modelo: 'MR 330', ano: '-' },
    { identificacao: 'EX-01', descricao: 'EXTRUSORA', localizacao: 'EXTRUSÃO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'AEX-01', descricao: 'EXTRUSORA DE PA', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: 'ATEMA', modelo: 'EX 60/30', ano: '2021' },
    { identificacao: 'AEX-02', descricao: 'EXTRUSORA DE PA', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: 'ATEMA', modelo: 'EX 60/30', ano: '2021', isKey: true },
    { identificacao: 'MI-04', descricao: 'MISTURADOR', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'EX-02', descricao: 'EXTRUSORA', localizacao: 'EXTRUSÃO', status: 'Ativo', fabricante: 'SAFETY SWITCH', modelo: '-', ano: '-', isKey: true },
    { identificacao: 'EX-03', descricao: 'EXTRUSORA', localizacao: 'EXTRUSÃO', status: 'Ativo', fabricante: 'WK WOREK', modelo: 'D8555', ano: '1992' },
    { identificacao: 'TA-03', descricao: 'TORNO AUTOMÁTICO', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'TRAUB', modelo: 'TA25', ano: '-' },
    { identificacao: 'FO-13', descricao: 'FORNO', localizacao: '-', status: 'Ativo', fabricante: 'SHAMMATHERM', modelo: 'SH-T', ano: '2013' },
    { identificacao: 'TF-02', descricao: 'TREFILA', localizacao: 'TREFILA', status: 'Ativo', fabricante: 'LOMBARD', modelo: '-', ano: '-' },
    { identificacao: 'FO-08', descricao: 'FORNO', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'ES-04', descricao: 'ESMERIL', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TC-01', descricao: 'TORNO CNC', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'NARDINI', modelo: 'L.195', ano: '2009' },
    { identificacao: 'TC-02', descricao: 'TORNO CNC', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'NARDINI', modelo: 'L.195', ano: '2009' },
    { identificacao: 'TC-03', descricao: 'TORNO CNC', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'NARDINI', modelo: 'L.195', ano: '2004' },
    { identificacao: 'TC-04', descricao: 'TORNO CNC', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'NARDINI', modelo: 'L.195', ano: '2006' },
    { identificacao: 'JT-01', descricao: 'JATO DE GRANALHA', localizacao: 'TUBULAÇÃO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TC-05', descricao: 'TORNO CNC', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'NARDINI', modelo: 'L.195', ano: '2008' },
    { identificacao: 'TC-06', descricao: 'TORNO CNC', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'NARDINI', modelo: 'L.195', ano: '2009' },
    { identificacao: 'TC-07', descricao: 'TORNO CNC', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'ROMI', modelo: 'CENTUR 30D', ano: '2007' },
    { identificacao: 'TC-08', descricao: 'TORNO CNC', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'NARDINI', modelo: 'L.350', ano: '2013' },
    { identificacao: 'MS-01', descricao: 'MAQUINA DE SOLDA', localizacao: '-', status: 'Inativo', fabricante: '-', modelo: '-', ano: '-' }, 
    { identificacao: 'JT-02', descricao: 'JATO DE OXIDO DE ALUMINIO', localizacao: 'TUBULAÇÃO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'EX-05', descricao: 'EXTRUSORA', localizacao: 'EXTRUSÃO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'EP-02', descricao: 'ESPULADEIRA', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: 'FUSOTEC', modelo: '72', ano: '1997' },
    { identificacao: 'FO-01', descricao: 'ESTUFA ELETRICA', localizacao: '-', status: 'Ativo', fabricante: 'TECHAIR', modelo: '-', ano: '-' },
    { identificacao: 'FO-02', descricao: 'ESTUFA ELETRICA', localizacao: '-', status: 'Ativo', fabricante: 'SEANDARD', modelo: 'SE-T', ano: '2003' },
    { identificacao: 'FO-03', descricao: 'FORNO', localizacao: '-', status: 'Ativo', fabricante: 'INCO', modelo: 'BTH3601485', ano: '-' },
    { identificacao: 'FO-04', descricao: 'FORNO', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'FO-05', descricao: 'FORNO', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'FO-06', descricao: 'FORNO', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'FO-07', descricao: 'FORNO', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-', isKey: true },
    { identificacao: 'PH-01', descricao: 'PRENSA HIDRÁULICA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PH-03', descricao: 'PRENSA HIDRÁULICA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PH-02', descricao: 'PRENSA DE MOLDAGEM', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: 'EKA', modelo: '-', ano: '-' },
    { identificacao: 'PH-04', descricao: 'PRENSA HIDRÁULICA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TD-03', descricao: 'TRANÇADEIRA', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TM-03', descricao: 'TORNO MECANICO', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'DIPLOMAT', modelo: 'ND.250', ano: '-' },
    { identificacao: 'TM-04', descricao: 'TORNO MECANICO', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'NARDINI', modelo: 'ND.250', ano: '2013' },
    { identificacao: 'TM-05', descricao: 'TORNO MECANICO', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'NARDINI', modelo: 'ND.250', ano: '2013' },
    { identificacao: 'TM-06', descricao: 'TORNO MECANICO', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'DIPLOMAT', modelo: 'NZ.400', ano: '2004/2005' },
    { identificacao: 'MG-01', descricao: 'MOLDAGEM COM GLICERINA', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PH-13', descricao: 'PRENSA HIDRAULICA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-', isKey: true },
    { identificacao: 'ES-03', descricao: 'ESMERIL', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PH-14', descricao: 'PRENSA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: 'LP COPÉ', modelo: 'PHR 600', ano: '11.02.85' },
    { identificacao: 'PH-16', descricao: 'PRENSA HIDRAULICA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: 'INCO', modelo: 'PC 30005385', ano: '-' },
    { identificacao: 'PH-18', descricao: 'PRENSA HIDRAULICA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: 'RANALLI', modelo: '-', ano: '-' },
    { identificacao: 'PH-19', descricao: 'PRENSA HIDRAULICA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: 'FAREX', modelo: '-', ano: '-' },
    { identificacao: 'TD-01', descricao: 'TRANÇADEIRA', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: 'FUSOTEC', modelo: 'W72', ano: '2004' },
    { identificacao: 'SF-01', descricao: 'SERRA', localizacao: '-', status: 'Ativo', fabricante: 'BALDAN', modelo: 'SFC-3', ano: '2020' },
    { identificacao: 'EX-04', descricao: 'EXTRUSORA', localizacao: 'EXTRUSÃO', status: 'Ativo', fabricante: 'JENNINGS', modelo: '-', ano: '-', isKey: true },
    { identificacao: 'PH-20', descricao: 'PRENSA HIDRAULICA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PH-05', descricao: 'PRENSA DE EIXO EXCENTRICO', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: 'FABBE', modelo: '-', ano: '-' },
    { identificacao: 'PH-06', descricao: 'PRENSA HIDRAULICA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PH-07', descricao: 'PRENSA DE MOLDAGEM', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-', isKey: true },
    { identificacao: 'MS-02', descricao: 'MAQUINA DE SOLDA', localizacao: 'TUBULAÇÃO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'MS-03', descricao: 'MAQUINA DE SOLDA', localizacao: 'TUBULAÇÃO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'MS-04', descricao: 'MAQUINA DE SOLDA', localizacao: 'TUBULAÇÃO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CT-01', descricao: 'CENTRO DE USINAGEM', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'ROMI', modelo: 'DISCOVERYV1250', ano: '2007' },
    { identificacao: 'PH-08', descricao: 'PRENSA HIDRAULICA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-', isKey: true },
    { identificacao: 'PH-09', descricao: 'PRENSA DE MOLDAGEM', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-', isKey: true },
    { identificacao: 'PH-10', descricao: 'PRENSA DE MOLDAGEM', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: 'INCO', modelo: 'PC1502385', ano: '-' },
    { identificacao: 'TM-02', descricao: 'TORNO MECANICO', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'NARDINI', modelo: 'MS205', ano: '-' },
    { identificacao: 'RE-01', descricao: 'RETIFICA DEWALT', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PH-17', descricao: 'PRENSA DE MOLDAGEM', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: 'RANALLI', modelo: '-', ano: '-' },
    { identificacao: 'SF-02', descricao: 'SERRA DE FITA', localizacao: '-', status: 'Ativo', fabricante: 'FRANHO', modelo: 'SH-4242NC', ano: '2013' },
    { identificacao: 'PM-01', descricao: 'PRÉ-MOLDE', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: 'JENNINGS', modelo: '-', ano: '-' },
    { identificacao: 'TA-04', descricao: 'TORNO AUTOMÁTICO', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'TRAUB', modelo: 'A25', ano: '-' },
    { identificacao: 'TA-05', descricao: 'TORNO AUTOMÁTICO', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'ATRAS MÁQUINA', modelo: 'ATRAS 15MM/25MM', ano: '2005' },
    { identificacao: 'EP-01', descricao: 'ESPULADEIRA', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: 'FUSOTEC', modelo: 'W1/W72', ano: '2014' },
    { identificacao: 'EP-03', descricao: 'ESPULADEIRA', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PO-01', descricao: 'POLICORTE', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TD-05', descricao: 'TRANÇADEIRA', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: 'FUSOTEC', modelo: 'W721A', ano: '2011' },
    { identificacao: 'EF-01', descricao: 'CONFORMADORA', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: 'CRIPPA', modelo: 'S2086', ano: '2023' },
    { identificacao: 'ML-01', descricao: 'MAQUINA A LASER', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: 'GALVO SCANNER', modelo: 'CMK-DESK-30', ano: '2023' },
    { identificacao: 'ML-02', descricao: 'MAQUINA A LASER', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CO-01', descricao: 'COMPRESSOR CHICAGO CPCm 40BD', localizacao: 'SALA DE MAQUINA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TM-01', descricao: 'TORNO MECANICO', localizacao: 'USINAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TS-01', descricao: 'TESTE DE ESTANQUEIDADE', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TD-06', descricao: 'TRANÇADEIRA', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CV-01', descricao: 'CURVADORA', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: 'CRIPPA', modelo: '1025E', ano: '2024' },
    { identificacao: 'RM-01', descricao: 'RECRAVADEIRA DE MANGUEIRAS', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: 'HYLIK', modelo: 'YB120L', ano: '2023' },
    { identificacao: 'CS-01', descricao: 'CABINE SECUNDARIA', localizacao: 'SALA DE MAQUINA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CPR-01', descricao: 'CABINE PRIMARIA', localizacao: 'SALA DE MAQUINA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'QI-01', descricao: 'QUADRO DE ILUMINAÇÃO', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'QDF-05', descricao: 'QUADRO DE FORÇA', localizacao: '-', status: 'Ativo', fabricante: 'ALTOVOLT', modelo: '-', ano: '2021' },
    { identificacao: 'QGC-01', descricao: 'QUADRO GERAL DO AR CONDICIONADO', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'FR-01', descricao: 'FRESADORA FERRAMENTARA', localizacao: 'FERRAMENTARIA', status: 'Ativo', fabricante: 'DIPLOMAT', modelo: '2000FVF', ano: '2000' },
    { identificacao: 'QDF-04', descricao: 'QUADRO DE FORÇA', localizacao: '-', status: 'Ativo', fabricante: 'ALTOVOLT', modelo: '-', ano: '2021' },
    { identificacao: 'QDF-02', descricao: 'QUADRO DE FORÇA', localizacao: '-', status: 'Ativo', fabricante: 'ALTOVOLT', modelo: '-', ano: '2021' },
    { identificacao: 'QDF-01', descricao: 'QUADRO DE FORÇA', localizacao: '-', status: 'Ativo', fabricante: 'ALTOVOLT', modelo: '-', ano: '2021' },
    { identificacao: 'QDF-06', descricao: 'QUADRO DE FORÇA', localizacao: '-', status: 'Ativo', fabricante: 'ALTOVOLT', modelo: '-', ano: '2021' },
    { identificacao: 'QUADRO ELETRICO-01', descricao: 'QUADRO ELETRICO (PORTARIA)', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'QUADRO ELETRICO-03', descricao: 'QUADRO ELETRICO (ENGENHARIA/PCD)', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TD-04', descricao: 'TRANÇADEIRA', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: 'FUSOTEC', modelo: '-', ano: '-', isKey: true },
    { identificacao: 'QUADRO ELETRICO-02', descricao: 'QUADRO ELETRICO (REFEITÓRIO)', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CA-01', descricao: 'CALANDRA', localizacao: 'USINAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'SI-01', descricao: 'SOLDA POR INDUÇÃO', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: 'GRC', modelo: 'WRG-15-10', ano: '-' },
    { identificacao: 'MI-01', descricao: 'MISTURADOR', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'MI-02', descricao: 'MISTURADOR', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'MI-03', descricao: 'MISTURADOR', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CH01', descricao: 'CHILLER', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: 'SMART-CHILLER', modelo: 'VAVO45A2PR', ano: '2023' },
    { identificacao: 'TF-04', descricao: 'TREFILA', localizacao: 'TREFILA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CR-02', descricao: 'MAQUINA DE CORRUGAR', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TD-07', descricao: 'TRANÇADEIRA', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: 'FUSOTEC', modelo: 'W72TA', ano: '2011' },
    { identificacao: 'TD-08', descricao: 'TRANÇADEIRA', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'BEB1', descricao: 'BEBEDOURO DIRETORIA', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'BEB2', descricao: 'BEBEDOURO ENGENHARIA', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'BEB5', descricao: 'BEBEDOURO AUTOMOTIVO', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'BEB6', descricao: 'BEBEDOURO INJEÇÃO', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CO-02', descricao: 'COMPRESSOR DE PARAFUSO', localizacao: 'SALA DE MAQUINA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CO-03', descricao: 'COMPRESSOR PISTÃO SCHULZ', localizacao: 'SALA DE MAQUINA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TF-03', descricao: 'TREFILA', localizacao: 'TREFILA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'EN-01', descricao: 'ENROLADOR DE FITA', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'FR-02', descricao: 'FRESADORA FERRAMENTARIA', localizacao: 'FERRAMENTARIA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CP-01', descricao: 'CABINE DE PINTURA HALAR', localizacao: 'TUBULAÇÃO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CP-02', descricao: 'CABINE DE PINTURA', localizacao: 'TUBULAÇÃO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TD-09', descricao: 'TRANÇADEIRA', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PH-11', descricao: 'PRENSA HIDRAULICA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: 'INCO', modelo: 'PC1503385', ano: '-' },
    { identificacao: 'PH-12', descricao: 'PRENSA HIDRAULICA', localizacao: 'MOLDAGEM', status: 'Ativo', fabricante: 'INCO', modelo: 'PC1504385', ano: '-' },
    { identificacao: 'TES-01', descricao: 'TESTE DE ESTANQUEIDADE', localizacao: 'TREFILA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CR-01', descricao: 'MAQUINA DE CORRUGAR', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'TM-07', descricao: 'TORNO MECANICO', localizacao: 'USINAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PX-01', descricao: 'PUXADOR', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CH-01', descricao: 'CHILLER', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: 'VAVO45A2PR201X', ano: '-' },
    { identificacao: 'TA-06', descricao: 'TORNO AUTOMATICO', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'TRAUB', modelo: 'TB-42', ano: '-' },
    { identificacao: 'TR-01', descricao: 'TORNO REVOLVER', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'ATRAS MÁQUINA', modelo: 'TR-25', ano: '2005' },
    { identificacao: 'RO-01', descricao: 'ROUTER', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'SCRIBA', modelo: 'SB1325TM', ano: '2016' },
    { identificacao: 'RO-02', descricao: 'ROUTER', localizacao: 'USINAGEM', status: 'Ativo', fabricante: 'ROCTECH', modelo: 'RO1525S-ATC-TM', ano: '2022' },
    { identificacao: 'VR-01', descricao: 'MÁQUINA DE VIROLA', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'LP-02', descricao: 'LAVADOR DE PEÇAS', localizacao: '-', status: 'Inativo', fabricante: 'GV EQUIPAMENTOS', modelo: '-', ano: '-' }, 
    { identificacao: 'PL-01', descricao: 'PLAINA', localizacao: '-', status: 'Ativo', fabricante: 'BALDAN', modelo: 'DPC-5', ano: '2008' },
    { identificacao: 'BA-012', descricao: 'BALANÇA', localizacao: '-', status: 'Ativo', fabricante: 'TOLEDO', modelo: '2003/38-2180', ano: '2014' },
    { identificacao: 'BA-010', descricao: 'BALANÇA', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: 'BCW30', ano: '2013' },
    { identificacao: 'FO-14', descricao: 'FORNO', localizacao: '-', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CR-03', descricao: 'MAQUINA DE CORRUGAR', localizacao: 'TRANÇADEIRA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CT-02', descricao: 'CENTRO DE USINAGEM', localizacao: 'USINAGEM', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'ET-01', descricao: 'ESTUFA DE FUNIL', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: 'XIECHENG', modelo: 'XC-G100KG', ano: '2025' },
    { identificacao: 'MV-01', descricao: 'MÁQUINA DE VIROLA (NOVA)', localizacao: 'ENCAMISAMENTO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '2026' },
    { identificacao: 'GE-01', descricao: 'GERADOR', localizacao: 'SALA DE MAQUINA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'SC-01', descricao: 'SERRA CIRCULAR', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: 'BERAT', modelo: '315B', ano: '-' },
    { identificacao: 'TRA-01', descricao: 'TORRE DE RESFRIAMENTO', localizacao: 'EXTRUSÃO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'CL-01', descricao: 'CAVALETE AR RESPIRATORIO (JATO DE GRANALHA)', localizacao: 'TUBULAÇÃO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'EX-06', descricao: 'EXTRUSORA', localizacao: 'EXTRUSÃO', status: 'Ativo', fabricante: 'SUKO', modelo: 'PFG150 RAM', ano: '-' },
    { identificacao: 'EX-07', descricao: 'EXTRUSORA', localizacao: 'EXTRUSÃO', status: 'Ativo', fabricante: 'SUKO', modelo: 'PFG150 RAM', ano: '-' },
    { identificacao: 'GUI-01', descricao: 'GUILHOTINA', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: 'POLIFLUOR', modelo: '-', ano: '2025' },
    { identificacao: 'REB-01', descricao: 'REBORDADEIRA', localizacao: 'AUTOMOTIVO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '2026' },
    { identificacao: 'TQ-01', descricao: 'TORQUÍMETRO DE ESTALO', localizacao: 'PRODUÇÃO', status: 'Ativo', fabricante: 'GEDORE', modelo: '4550-20', ano: '2025' },

    // --- INFRAESTRUTURA PREDIAL (NOVOS ITENS) ---
    // Civil / Estrutural
    { identificacao: 'PRD-PT-01', descricao: 'PORTÃO PRINCIPAL (AUTOMÁTICO)', localizacao: 'PORTARIA', status: 'Ativo', fabricante: 'PPA', modelo: 'DZ RIO', ano: '-' },
    { identificacao: 'PRD-PT-02', descricao: 'PORTÃO LATERAL (EXPEDIÇÃO)', localizacao: 'EXPEDIÇÃO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PRD-TL-01', descricao: 'TELHADO FABRIL (GERAL)', localizacao: 'FÁBRICA', status: 'Ativo', fabricante: '-', modelo: 'METÁLICO', ano: '-' },
    { identificacao: 'PRD-TL-02', descricao: 'CALHAS E RUFOS', localizacao: 'FÁBRICA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PRD-PS-01', descricao: 'PISO FABRIL (EPOXI/CONCRETO)', localizacao: 'PRODUÇÃO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PRD-DV-01', descricao: 'DIVISÓRIAS ESCRITÓRIO', localizacao: 'ADM', status: 'Ativo', fabricante: '-', modelo: 'EUCATEX', ano: '-' },
    
    // Instalações Hidráulicas
    { identificacao: 'PRD-HID-01', descricao: 'CAIXA D AGUA SUPERIOR', localizacao: 'TELHADO', status: 'Ativo', fabricante: 'FORTLEV', modelo: '10000L', ano: '-' },
    { identificacao: 'PRD-HID-02', descricao: 'REDE DE HIDRANTES', localizacao: 'FÁBRICA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PRD-HID-03', descricao: 'BOMBA DE RECALQUE', localizacao: 'CASA DE BOMBAS', status: 'Ativo', fabricante: 'SCHNEIDER', modelo: 'BC-92', ano: '-' },
    { identificacao: 'PRD-WC-01', descricao: 'BANHEIRO MASCULINO (FABRIL)', localizacao: 'VESTIÁRIO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PRD-WC-02', descricao: 'BANHEIRO FEMININO (FABRIL)', localizacao: 'VESTIÁRIO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PRD-WC-03', descricao: 'BANHEIRO ADM', localizacao: 'ESCRITÓRIO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    
    // Instalações Elétricas Prediais
    { identificacao: 'PRD-ILU-01', descricao: 'ILUMINAÇÃO FABRIL (LEDS)', localizacao: 'PRODUÇÃO', status: 'Ativo', fabricante: '-', modelo: 'HIGH BAY', ano: '-' },
    { identificacao: 'PRD-ILU-02', descricao: 'ILUMINAÇÃO EXTERNA', localizacao: 'PÁTIO', status: 'Ativo', fabricante: '-', modelo: 'REFLETOR 200W', ano: '-' },
    { identificacao: 'PRD-ILU-03', descricao: 'ILUMINAÇÃO ESCRITÓRIO', localizacao: 'ADM', status: 'Ativo', fabricante: '-', modelo: 'CALHA LED', ano: '-' },
    { identificacao: 'PRD-QD-G', descricao: 'QUADRO DE DISTRIBUIÇÃO GERAL (QDG)', localizacao: 'CABINE PRIMÁRIA', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PRD-LUZ-EM', descricao: 'LUZES DE EMERGÊNCIA', localizacao: 'GERAL', status: 'Ativo', fabricante: 'INTELBRAS', modelo: '-', ano: '-' },
    
    // HVAC (Ar Condicionado e Ventilação)
    { identificacao: 'PRD-AC-01', descricao: 'AR CONDICIONADO SPLIT', localizacao: 'DIRETORIA', status: 'Ativo', fabricante: 'LG', modelo: '12000 BTUS', ano: '-' },
    { identificacao: 'PRD-AC-02', descricao: 'AR CONDICIONADO SPLIT', localizacao: 'RH/FINANCEIRO', status: 'Ativo', fabricante: 'SAMSUNG', modelo: '18000 BTUS', ano: '-' },
    { identificacao: 'PRD-AC-03', descricao: 'AR CONDICIONADO SPLIT', localizacao: 'ENGENHARIA', status: 'Ativo', fabricante: 'GREE', modelo: '12000 BTUS', ano: '-' },
    { identificacao: 'PRD-AC-04', descricao: 'AR CONDICIONADO SPLIT', localizacao: 'TI/SERVIDOR', status: 'Ativo', fabricante: 'DAIKIN', modelo: '9000 BTUS', ano: '-' },
    { identificacao: 'PRD-EX-01', descricao: 'EXAUSTORES EÓLICOS', localizacao: 'TELHADO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
    { identificacao: 'PRD-VEN-01', descricao: 'VENTILADORES DE PAREDE', localizacao: 'PRODUÇÃO', status: 'Ativo', fabricante: 'VENTISILVA', modelo: '60CM', ano: '-' },

    // Segurança e Diversos
    { identificacao: 'PRD-EXT-01', descricao: 'EXTINTORES DE INCÊNDIO', localizacao: 'GERAL', status: 'Ativo', fabricante: '-', modelo: 'PQS/CO2/AGUA', ano: '-' },
    { identificacao: 'PRD-CFTV', descricao: 'SISTEMA DE CÂMERAS (CFTV)', localizacao: 'GERAL', status: 'Ativo', fabricante: 'INTELBRAS', modelo: 'DVR 16CH', ano: '-' },
    { identificacao: 'PRD-REL', descricao: 'RELÓGIO DE PONTO', localizacao: 'PORTARIA', status: 'Ativo', fabricante: 'DIMEP', modelo: '-', ano: '-' },
    { identificacao: 'PRD-JAR', descricao: 'JARDINAGEM E PAISAGISMO', localizacao: 'EXTERNO', status: 'Ativo', fabricante: '-', modelo: '-', ano: '-' },
];

export const rawInventoryData: SparePart[] = [
    { id: 'RE-001', name: 'Rolamento de encosto - 51106', location: 'P2B1', unit: 'PÇ', cost: 45.00, minStock: 12, currentStock: 13 },
    { id: 'RO-001', name: 'Rolamento 6201ZZ', location: 'P2B1', unit: 'PÇ', cost: 12.00, minStock: 10, currentStock: 10 },
    { id: 'BF-001', name: 'Base de freio do carretel', location: 'P3C4', unit: 'PÇ', cost: 150.00, minStock: 12, currentStock: 12 },
    { id: 'PE-001', name: 'Pino elástico 4x20', location: 'P2B1', unit: 'PÇ', cost: 2.00, minStock: 20, currentStock: 20 },
    { id: 'RO-002', name: 'Rolamento UC207', location: 'P2B1', unit: 'PÇ', cost: 35.00, minStock: 2, currentStock: 2 },
    { id: 'CO-001', name: 'Contatora WEG CWM09/10E', location: 'P3C3', unit: 'PÇ', cost: 85.00, minStock: 1, currentStock: 1 },
    { id: 'COR-001', name: 'Correia AXS40', location: 'P1A3', unit: 'PÇ', cost: 40.00, minStock: 3, currentStock: 3 },
    { id: 'COR-002', name: 'Correia AXS35', location: 'P1A3', unit: 'PÇ', cost: 38.00, minStock: 2, currentStock: 2 },
    { id: 'COR-003', name: 'Correia A63', location: 'P1A1', unit: 'PÇ', cost: 42.00, minStock: 2, currentStock: 2 },
    { id: 'CO-002', name: 'Contatora CWM25', location: 'P3C3', unit: 'PÇ', cost: 120.00, minStock: 1, currentStock: 1 },
    { id: 'OL-001', name: 'Óleo Hidráulico 68', location: 'ALM', unit: 'L', cost: 20.00, minStock: 200, currentStock: 20 },
    { id: 'DJ-001', name: 'Disjuntor Tripolar 50A', location: 'P3C1', unit: 'PÇ', cost: 110.00, minStock: 2, currentStock: 2 },
    { id: 'FO-001', name: 'Filtro de Óleo Hidráulico PSH486', location: 'P2B4', unit: 'PÇ', cost: 80.00, minStock: 1, currentStock: 1 },
    { id: 'CO-003', name: 'Contatora Siemens 3TS35', location: 'P3C3', unit: 'PÇ', cost: 150.00, minStock: 1, currentStock: 1 },
    { id: 'RO-003', name: 'Rolamento UC206', location: 'P2B3', unit: 'PÇ', cost: 30.00, minStock: 2, currentStock: 2 },
    { id: 'RO-004', name: 'Rolamento 6206ZZ', location: 'P2B3', unit: 'PÇ', cost: 25.00, minStock: 2, currentStock: 2 },
    { id: 'DJ-002', name: 'Disjuntor Tripolar 15A', location: 'P3C1', unit: 'PÇ', cost: 60.00, minStock: 1, currentStock: 1 },
    { id: 'DJ-003', name: 'Disjuntor Tripolar 20A', location: 'P3C1', unit: 'PÇ', cost: 60.00, minStock: 1, currentStock: 1 },
    { id: 'DJ-004', name: 'Disjuntor Tripolar 25A', location: 'P3C1', unit: 'PÇ', cost: 65.00, minStock: 1, currentStock: 1 },
    { id: 'DJ-005', name: 'Disjuntor Tripolar 30A', location: 'P3C1', unit: 'PÇ', cost: 70.00, minStock: 1, currentStock: 1 },
    { id: 'DJ-006', name: 'Disjuntor Bipolar 25A', location: 'P3C2', unit: 'PÇ', cost: 50.00, minStock: 1, currentStock: 1 },
    { id: 'DJ-007', name: 'Disjuntor Tripolar 100A', location: 'P3C2', unit: 'PÇ', cost: 200.00, minStock: 1, currentStock: 1 },
    { id: 'DJB-001', name: 'Disjuntor Bipolar 6A', location: 'P3C2', unit: 'PÇ', cost: 40.00, minStock: 1, currentStock: 1 },
    { id: 'DJB-002', name: 'Disjuntor Bipolar 16A', location: 'P3C2', unit: 'PÇ', cost: 45.00, minStock: 1, currentStock: 1 },
    { id: 'DJB-003', name: 'Disjuntor Bipolar 40A', location: 'P3C2', unit: 'PÇ', cost: 55.00, minStock: 1, currentStock: 1 },
    { id: 'COR-004', name: 'Correia AXS51', location: 'P1A4', unit: 'PÇ', cost: 45.00, minStock: 2, currentStock: 2 },
    { id: 'COR-005', name: 'Correia AXS58', location: 'P1A2', unit: 'PÇ', cost: 48.00, minStock: 2, currentStock: 2 },
    { id: 'COR-006', name: 'Correia AXS69', location: 'P1A3', unit: 'PÇ', cost: 52.00, minStock: 2, currentStock: 2 },
    { id: 'COR-007', name: 'Correia A50', location: 'P1A1', unit: 'PÇ', cost: 35.00, minStock: 2, currentStock: 2 },
    { id: 'COR-008', name: 'Correia A49', location: 'P1A2', unit: 'PÇ', cost: 34.00, minStock: 2, currentStock: 2 },
    { id: 'COR-009', name: 'Correia A59', location: 'P1A2', unit: 'PÇ', cost: 38.00, minStock: 2, currentStock: 2 },
    { id: 'COR-010', name: 'Correia AXS41', location: 'P1A3', unit: 'PÇ', cost: 30.00, minStock: 2, currentStock: 2 },
    { id: 'COR-011', name: 'Correia AXS43', location: 'P1A1', unit: 'PÇ', cost: 32.00, minStock: 2, currentStock: 2 },
    { id: 'COR-012', name: 'Correia AXS33', location: 'P1A3', unit: 'PÇ', cost: 28.00, minStock: 2, currentStock: 2 },
    { id: 'COR-013', name: 'Correia AXS36', location: 'P1A2', unit: 'PÇ', cost: 29.00, minStock: 2, currentStock: 2 },
    { id: 'COR-014', name: 'Correia AXS38', location: 'P1A3', unit: 'PÇ', cost: 30.00, minStock: 2, currentStock: 2 },
    { id: 'COR-015', name: 'Correia AXS39', location: 'P1A4', unit: 'PÇ', cost: 31.00, minStock: 2, currentStock: 2 },
    { id: 'COR-016', name: 'Correia AXS45', location: 'P1A3', unit: 'PÇ', cost: 33.00, minStock: 2, currentStock: 2 },
    { id: 'COR-017', name: 'Correia AXS47', location: 'P1A3', unit: 'PÇ', cost: 34.00, minStock: 2, currentStock: 2 },
    { id: 'COR-018', name: 'Correia AXS48', location: 'P1A1', unit: 'PÇ', cost: 35.00, minStock: 2, currentStock: 2 },
    { id: 'COR-019', name: 'Correia AXS49', location: 'P1A1', unit: 'PÇ', cost: 36.00, minStock: 2, currentStock: 2 },
    { id: 'COR-020', name: 'Correia AXS61', location: 'P1A1', unit: 'PÇ', cost: 50.00, minStock: 2, currentStock: 2 },
    { id: 'COR-021', name: 'Correia A27', location: 'P1A1', unit: 'PÇ', cost: 20.00, minStock: 2, currentStock: 4 },
    { id: 'COR-022', name: 'Correia AXS79', location: 'P1A4', unit: 'PÇ', cost: 60.00, minStock: 2, currentStock: 2 },
    { id: 'COR-023', name: 'Correia B60', location: 'P1A2', unit: 'PÇ', cost: 45.00, minStock: 2, currentStock: 2 },
    { id: 'COR-024', name: 'Correia B58', location: 'P1A2', unit: 'PÇ', cost: 44.00, minStock: 2, currentStock: 2 },
    { id: 'COR-025', name: 'Correia AXS52', location: 'P1A4', unit: 'PÇ', cost: 46.00, minStock: 2, currentStock: 2 },
    { id: 'COR-026', name: 'Correia A60', location: 'P1A1', unit: 'PÇ', cost: 40.00, minStock: 2, currentStock: 2 },
    { id: 'RO-05', name: 'Rolamento UC208', location: 'P2B2', unit: 'PÇ', cost: 40.00, minStock: 2, currentStock: 2 },
    { id: 'RO-06', name: 'Rolamento 6200 ZZ', location: 'P2B1', unit: 'PÇ', cost: 10.00, minStock: 2, currentStock: 2 },
    { id: 'RO-07', name: 'Rolamento 6202 ZZ', location: 'P2B1', unit: 'PÇ', cost: 12.00, minStock: 2, currentStock: 2 },
    { id: 'RO-08', name: 'Rolamento 6207 ZZ', location: 'P2B1', unit: 'PÇ', cost: 28.00, minStock: 2, currentStock: 2 },
    { id: 'RO-09', name: 'Rolamento 6205 ZZ', location: 'P2B3', unit: 'PÇ', cost: 22.00, minStock: 2, currentStock: 2 },
    { id: 'RO-10', name: 'Rolamento 6006 ZZ', location: 'P2B3', unit: 'PÇ', cost: 24.00, minStock: 2, currentStock: 2 },
    { id: 'RO-11', name: 'Rolamento 6004 ZZ', location: 'P2B3', unit: 'PÇ', cost: 18.00, minStock: 2, currentStock: 2 },
    { id: 'DJ-008', name: 'Disjuntor Tripolar 10A', location: 'P3C2', unit: 'PÇ', cost: 55.00, minStock: 1, currentStock: 1 },
    { id: 'DJB-004', name: 'Disjuntor Bipolar 10A', location: 'P3C2', unit: 'PÇ', cost: 42.00, minStock: 1, currentStock: 1 },
    { id: 'DJB-005', name: 'Disjuntor Bipolar 32A', location: 'P3C2', unit: 'PÇ', cost: 50.00, minStock: 1, currentStock: 1 },
    { id: 'BGR-001', name: 'Base guia do robo', location: 'P3C4', unit: 'PÇ', cost: 250.00, minStock: 2, currentStock: 2 },
    { id: 'OL-002', name: 'Óleo para redutor 320', location: 'P2B4', unit: 'UN', cost: 150.00, minStock: 1, currentStock: 1 },
    { id: 'CO-004', name: 'Contatora CJX2-12', location: 'P3C3', unit: 'PÇ', cost: 90.00, minStock: 1, currentStock: 1 },
    { id: 'CO-005', name: 'Contatora Schneider LC1D18M7', location: 'P3C2', unit: 'PÇ', cost: 130.00, minStock: 1, currentStock: 1 },
    { id: 'SPC-001', name: 'Sensor de Pressão do Compressor', location: 'P3C4', unit: 'PÇ', cost: 180.00, minStock: 1, currentStock: 1 },
    { id: 'FIL-1518512', name: 'Filtro 1518512 (Gerador)', location: 'ALM-02-A', unit: 'PÇ', cost: 120.00, minStock: 2, currentStock: 2 },
    { id: 'FIL-COMB', name: 'Filtro de Combustível', location: 'ALM-02-A', unit: 'PÇ', cost: 45.00, minStock: 2, currentStock: 4 },
    { id: 'FIL-SEP', name: 'Filtro Separadores', location: 'ALM-02-A', unit: 'PÇ', cost: 80.00, minStock: 2, currentStock: 2 },
    { id: 'FIL-CART', name: 'Cartucho Filtro Capacete (Jato)', location: 'ALM-02-B', unit: 'PÇ', cost: 35.00, minStock: 5, currentStock: 10 },
    { id: 'FIL-AR-WANE', name: 'Filtro de Ar Wane Cód. 8011757', location: 'ALM-02-C', unit: 'PÇ', cost: 150.00, minStock: 1, currentStock: 1 },
    { id: 'FIL-RESP', name: 'Filtro Separador Preliminar (Ar Resp)', location: 'ALM-02-D', unit: 'PÇ', cost: 60.00, minStock: 2, currentStock: 3 },
    { id: 'FIL-SECOS', name: 'Filtros Secos (Cabine Pintura)', location: 'ALM-02-E', unit: 'PÇ', cost: 25.00, minStock: 10, currentStock: 15 },
    { id: 'ROL-32005', name: 'Rolamento Cônico 32005', location: 'ALM-03-B', unit: 'PÇ', cost: 45.00, minStock: 4, currentStock: 6 },
    { id: 'ROL-6204', name: 'Rolamento SKF 6204', location: 'ALM-03-C', unit: 'PÇ', cost: 18.20, minStock: 8, currentStock: 2 },
    { id: 'MANG-JATO', name: 'Mangueira de Jato de Granalha', location: 'ALM-04-A', unit: 'M', cost: 55.00, minStock: 10, currentStock: 20 },
    { id: 'RESIST', name: 'Resistência Elétrica', location: 'ALM-04-B', unit: 'PÇ', cost: 85.00, minStock: 5, currentStock: 8 },
    { id: 'VIDRO-CAB', name: 'Vidros do Teto da Cabine', location: 'ALM-04-C', unit: 'PÇ', cost: 200.00, minStock: 1, currentStock: 2 },
];

interface ScheduleRule {
    typeId: string;
    frequency: number;
    startMonth: number;
    description: string;
    checklist: TaskDetail[];
}

export const rawScheduleRules: ScheduleRule[] = [
    { 
        typeId: 'GE', frequency: 12, startMonth: 0, description: "Revisão Periódica - GE", 
        checklist: [
            { action: "Substituição de Óleo e Filtro do Óleo", materials: "Filtro: 1518512, filtro de combustível, filtro separados" },
            { action: "Visão geral do equipamento" }
        ]
    },
    { 
        typeId: 'MG', frequency: 3, startMonth: 1, description: "Revisão Periódica - MG", 
        checklist: [
            { action: "ANALISAR CONDIÇÕES GERAIS" },
            { action: "REAPERTO DE CONTATOS ELÉTRICOS" }
        ]
    },
    { 
        typeId: 'CF', frequency: 12, startMonth: 5, description: "Revisão Periódica - CF", 
        checklist: [
            { action: "VERIFICAÇÃO GERAL DO EQUIPAMENTO" },
            { action: "VERIFICAÇÃO DE TEMPERATURA" },
            { action: "MEDIÇÃO DE CORRENTE DO MOTOR" }
        ]
    },
    { 
        typeId: 'ES', frequency: 6, startMonth: 0, description: "Inspeção Semestral de Segurança - ES", 
        checklist: [
            { action: "Verificar estado dos rebolos (trincas)" },
            { action: "Ajustar apoio de peça (máx 3mm do rebolo)" },
            { action: "Verificar proteção visual (acrílico)" },
            { action: "Teste de isolamento elétrico" }
        ] 
    },
    { 
        typeId: 'MS', frequency: 2, startMonth: 0, description: "Revisão Periódica - MS", 
        checklist: [
            { action: "VERIFICAR ASPECTO VISUAL E ESTRUTURAL DO EQUIPAMENTO" },
            { action: "VERIFICAR INSTALAÇÃO ELÉTRICA" },
            { action: "VERIFICAR REFRIGERAÇÃO (COOLER, MANGUEIRAS, ABRAÇADEIRAS, LUZES DE ACION)" },
            { action: "VERIFICAR MOTOR E BOMBA DÁGUA" },
            { action: "VERIFICAR CABOS DE SOLDA POSITIVO E NEGATIVO" },
            { action: "VERIFICAR TOCHA DE SOLDAGEM" },
            { action: "VERIFICAR MANGUEIRA DE CONDUÇÃO DE AGUA" },
            { action: "EXECUTAR LIMPEZA INTERNA COM SOPRADOR DE AR" }
        ]
    },
    { 
        typeId: 'JT', frequency: 3, startMonth: 0, description: "Revisão Periódica - JT", 
        checklist: [
            { action: "VERIFICAR PAINEL ELETRICO" },
            { action: "VERIFICAR LUMINARIAS" },
            { action: "VERIFICAR VEDAÇÕES DA PORTA" },
            { action: "VERIFICAR TUBULAÇÃO DO POTE DE GRANALHA" },
            { action: "TROCA DO CARTUCHO DO FILTRO CAPACETE" },
            { action: "VERIFICAR MANGUEIRA DO JATO DE GRANALHA" },
            { action: "VERIFICAR ELEVADOR DE CANECA" },
            { action: "VERIFICAR PULMÃO DE AR" }
        ]
    },
    { 
        typeId: 'EX', frequency: 3, startMonth: 0, description: "Revisão Periódica - EX", 
        checklist: [
            { action: "REAPERTO DE CONTATOS ELÉTRICOS" },
            { action: "VERIFICAÇÃO DE ÓLEO ANTES DA PARTIDA", materials: "OLEO ISO VG 68, OLEO PARA COMPRESSOR" },
            { action: "MEDIÇÃO DE CORRENTE DO MOTOR (220V)" },
            { action: "VERIFICAR VAZAMENTOS" },
            { action: "LIMPEZA INTERNA DO PAINEL" },
            { action: "VERIFICAR CILINDRO HIDRÁULICO" },
            { action: "VERIFICAR RESISTENCIA" },
            { action: "VERIFICAR QUEIMADOR" }
        ]
    },
    { 
        typeId: 'FO', frequency: 3, startMonth: 0, description: "Revisão Periódica - FO", 
        checklist: [
            { action: "REAPERTO DOS CONTATOS ELÉTRICOS" },
            { action: "MEDIÇÃO DE CORRENTE DO MOTOR" },
            { action: "REAPERTO DAS CORREIAS DO MOTOR" }
        ]
    },
    { 
        typeId: 'MI', frequency: 12, startMonth: 6, description: "Revisão Periódica - MI", 
        checklist: [
            { action: "REAPERTO DE PARAFUSOS" },
            { action: "MEDIÇÃO DE CORRENTE DO MOTOR" },
            { action: "VERIFICAR NÍVEL DE ÓLEO", materials: "ÓLEO ISO VG 68" }
        ] 
    },
    { 
        typeId: 'PH', frequency: 3, startMonth: 0, description: "Revisão Periódica - PH", 
        checklist: [
            { action: "VERIFICAÇÃO DO NIVEL DE OLEO ANTES DA PARTIDA", materials: "OLÉO ISO VG 68" },
            { action: "MEDIÇÃO DE CORRENTE DO MOTOR" },
            { action: "REAPERTO DE CONTATOS ELÉTRICOS" },
            { action: "APERTO DE TERMINAIS" },
            { action: "LIMPEZA INTERNA DOS COMPONENTES" },
            { action: "VERIFICAÇÃO DO SISTEMA HIDRÁULICO" }
        ]
    },
    { 
        typeId: 'PM', frequency: 3, startMonth: 1, description: "Revisão Periódica - PM", 
        checklist: [
            { action: "VERIFICAÇÃO DO NÍVEL DE ÓLEO ANTES DA PARTIDA", materials: "ÓLEO ISO VG 68" },
            { action: "MEDIÇÃO DE CORRENTE DO MOTOR" },
            { action: "VERIFICAR RESISTÊNCIA" }
        ]
    },
    { 
        typeId: 'PO', frequency: 3, startMonth: 2, description: "Revisão Periódica - PO", 
        checklist: [
            { action: "Verificar proteções" }, { action: "Verificar disco" }, { action: "Base do motor" },
            { action: "Painel elétrico" }, { action: "Chave de acionamento" }, { action: "Correia" },
            { action: "Motor" }, { action: "Mesa" }
        ]
    },
    { 
        typeId: 'SF', frequency: 6, startMonth: 0, description: "Revisão Periódica - SF", 
        checklist: [
            { action: "VERIFICAR MOTOR" }, { action: "VERIFICAR MESA POSICIONADORA" },
            { action: "VERIFICAR POLIAS" }, { action: "VERIFICAR CORREIAS ELETRICAS" },
            { action: "VERIFICAR COMPONENTES" }, { action: "VERIFICAR PAINEL ELETRICO" },
            { action: "VERIFICAR VOLANTE DE ACIONAMENTO" }, { action: "VERIFICAR PISTÃO DE ACIONAMENTO" },
            { action: "VERIFICAR ÓLEO DE CORTE" }, { action: "VERIFICAR ROSCA T. ARRASTE" }
        ]
    },
    { 
        typeId: 'TA', frequency: 6, startMonth: 1, description: "Revisão Periódica - TA", 
        checklist: [
            { action: "VERIFICAÇÃO DE ROLAMENTOS", materials: "ROLAMENTO 6202 ZZ, ROLAMENTO CONICO 32005, ROLAMENTO SKF 6204" },
            { action: "MEDIÇÃO DE CORRENTE DO MOTOR" },
            { action: "REAPERTO DE CONTATOS ELÉTRICOS" }
        ]
    },
    { 
        typeId: 'TB', frequency: 12, startMonth: 3, description: "Revisão Periódica - TB", 
        checklist: [
            { action: "MEDIÇÃO DE CORRENTE DO MOTOR" },
            { action: "VERIFICAÇÃO DE ROLAMENTOS", materials: "ROLAMENTO 6202 ZZ, ROLAMENTO CONICO 32005, ROLAMENTO SKF 6204" }
        ]
    },
    { 
        typeId: 'TD', frequency: 3, startMonth: 0, description: "Revisão Periódica - TD", 
        checklist: [
            { action: "VERIFICAR PRESILHA DA ESPULHA" }, { action: "VERIFICAR ROLDANA DA ESPULHA" },
            { action: "MEDIÇÃO DA CORRENTE DO MOTOR", materials: "OLÉO 320 ou 360 no redutor" },
            { action: "VERIFICAR PAINEL ELÉTRICO" }, { action: "VERIFICAR REDUTOR" },
            { action: "VERIFICAR BOTOEIRAS E CONTATOS" }, { action: "VERIFICAR MOTOR" }
        ]
    },
    { 
        typeId: 'CO', frequency: 12, startMonth: 8, description: "Revisão Periódica - Compressor", 
        checklist: [
            { action: "Verificar Filtro de ar" }, { action: "Verificar filtro de óleo" },
            { action: "Verificar óleo" }, { action: "Verificar painel elétrico" },
            { action: "Verificar correia" }, { action: "Verificar cilindro - vaso de pressão" }
        ]
    },
    { 
        typeId: 'TM', frequency: 6, startMonth: 2, description: "Revisão Periódica - TM", 
        checklist: [
            { action: "VERIFICAÇÃO DO NÍVEL DE ÓLEO ANTES DA PARTIDA", materials: "OLEO ISO VG 68" },
            { action: "REAPERTO DE PARAFUSOS" },
            { action: "REAPERTO DAS CORREIAS DO MOTOR" },
            { action: "REAPERTO DE CONTATOS ELÉTRICOS" }
        ]
    },
    { 
        typeId: 'TC', frequency: 9, startMonth: 0, description: "Revisão Periódica - TC", 
        checklist: [
            { action: "VERIFICAR RUÍDO DOS ROLAMENTOS" },
            { action: "VERIFICAR NIVEL DE ÓLEO ANTES DA PARTIDA", materials: "ÓLEO ISO VG 68" },
            { action: "ANALISAR CONDIÇÕES GERAIS DO EQUIPAMENTO" }
        ]
    },
    { 
        typeId: 'AEX', frequency: 3, startMonth: 0, description: "Revisão Periódica - AEX", 
        checklist: [
            { action: "LIMPEZA DO EQUIPAMENTO", materials: "FILTRO DE AR WANE CÓD. 8011757" },
            { action: "VERIFICAÇÃO DE VAZAMENTOS" },
            { action: "VERIFICAÇÃO DE NÍVEL DE ÓLEO ANTES DA PARTIDA" },
            { action: "REAPERTO DE CONTATOS ELÉTRICOS" },
            { action: "MEDIÇÃO DE CORRENTE DO MOTOR" }
        ]
    },
    { 
        typeId: 'CT', frequency: 6, startMonth: 4, description: "Revisão Periódica - CT", 
        checklist: [
            { action: "VERIFICAÇÃO DO NÍVEL DE ÓLEO ANTES DA PARTIDA" },
            { action: "REAPERTO DE CONTATOS ELÉTRICOS" },
            { action: "MEDIÇÃO DE CORRENTE DO MOTOR" },
            { action: "Aperto de correias do motor" }
        ]
    },
    { 
        typeId: 'TF', frequency: 3, startMonth: 2, description: "Revisão Periódica - TF", 
        checklist: [
            { action: "VERIFICAÇÃO DE MOTOR E ROLAMENTO" },
            { action: "VERIFICAÇÃO DO REDUTOR" },
            { action: "APERTO DOS COMPONENTES ELÉTRICOS" }
        ]
    },
    { 
        typeId: 'CR', frequency: 2, startMonth: 1, description: "Revisão Periódica - CR", 
        checklist: [
            { action: "VERIFICAR RESISTENCIA" }, { action: "VERIFICAR ARVORE DA PLACA" },
            { action: "VERIFICAR INVERSOR" }, { action: "VERIFICAR REDUTOR" }
        ]
    },
    { 
        typeId: 'RO', frequency: 6, startMonth: 2, description: "Revisão Periódica - RO", 
        checklist: [
            { action: "Verificar painel elétrico" }, { action: "Verificar mangueiras" },
            { action: "Verificar lubrificação" }, { action: "Verificar rolamentos mandril" }
        ]
    },
    { 
        typeId: 'ET', frequency: 6, startMonth: 2, description: "Revisão Periódica - ET", 
        checklist: [
            { action: "VERIFICAR TANQUE FUNIL" }, { action: "VERIFICAR VENTILADOR" },
            { action: "VERIFICAR DISJUNTOR E RELÊ TÉRMICO" }
        ] 
    },
    { 
        typeId: 'MV', frequency: 3, startMonth: 0, description: "Revisão Periódica - MV", 
        checklist: [
            { action: "VERIFICAR AGUA DO CHILLER" }, { action: "VERIFICAR PRESSÃO" }
        ] 
    },
    { 
        typeId: 'SI', frequency: 3, startMonth: 2, description: "Revisão Periódica - SI", 
        checklist: [
            { action: "VERIFICAR ESTADO DOS INDUTORES" }, { action: "FAZER TROCA ÁGUA DEIONIZADA" }
        ]
    },
    { 
        typeId: 'SC', frequency: 3, startMonth: 0, description: "Revisão Periódica - SC", 
        checklist: [
            { action: "VERIFICAR MOTOR" }, { action: "VERIFICAR DISCO" }, { action: "VERIFICAR MESA" }
        ] 
    },
    { 
        typeId: 'EP', frequency: 3, startMonth: 1, description: "Revisão Periódica - EP", 
        checklist: [
            { action: "VERIFICAÇÃO DE ROLAMENTOS" }, { action: "VERIFICAÇÃO DE ROLOS DE AÇO" }
        ]
    },
    { 
        typeId: 'TQ', frequency: 6, startMonth: 6, description: "CALIBRAÇÃO E REVISÃO - TQ", 
        checklist: [
            { action: "Calibração rastreável RBC" }
        ]
    },
    { 
        typeId: 'REB', frequency: 12, startMonth: 0, description: "Revisão Periódica - Rebordadeira", 
        checklist: [
            { action: "VERIFICAR ALINHAMENTO" }, { action: "LUBRIFICAR GUIAS" }, { action: "APERTO ESTRUTURAL" }
        ]
    }
];

import { http, HttpResponse } from "msw";
import { baseUrl } from "../../services/apiClient";
import { mockSessions } from "../db";

/** Read access_token from Cookie header and resolve to a userId */
const getAuthUserId = (request: Request): string | null => {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const pairs = cookieHeader.split(";").map((p) => p.trim());
  for (const pair of pairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) continue;
    const key = pair.slice(0, eqIdx).trim();
    const val = pair.slice(eqIdx + 1).trim();
    if (key === "access_token") {
      return mockSessions[val] ?? null;
    }
  }
  return null;
};

/** Generates a minimal self-contained HTML receipt for the given size */
const buildReceiptHtml = (ticketId: string, size: string): string => {
  const isA4 = size === 'a4';
  const is80 = size === '80mm';
  const width = isA4 ? '210mm' : size;
  const qrSize = isA4 ? '50mm' : is80 ? '40mm' : '30mm';
  const pageSize = isA4 ? 'a4' : `${size} auto`;
  const wrapperStyle = isA4
    ? 'max-width:80mm;margin:20mm auto;'
    : '';

  // Minimal placeholder QR — a real server would embed a proper base64 QR
  const qrPlaceholder = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="30" height="30" fill="black"/><rect x="15" y="15" width="20" height="20" fill="white"/><rect x="20" y="20" width="10" height="10" fill="black"/><rect x="60" y="10" width="30" height="30" fill="black"/><rect x="65" y="15" width="20" height="20" fill="white"/><rect x="70" y="20" width="10" height="10" fill="black"/><rect x="10" y="60" width="30" height="30" fill="black"/><rect x="15" y="65" width="20" height="20" fill="white"/><rect x="20" y="70" width="10" height="10" fill="black"/><rect x="45" y="45" width="10" height="10" fill="black"/><rect x="60" y="60" width="10" height="10" fill="black"/><rect x="75" y="60" width="10" height="10" fill="black"/><rect x="60" y="75" width="10" height="10" fill="black"/><rect x="75" y="75" width="10" height="10" fill="black"/></svg>`)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Ticket - ${ticketId}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Courier New',monospace;font-size:11px;background:#fff;color:#000;width:${width};}
.receipt-wrapper{${wrapperStyle}}
.receipt{width:100%;padding:4mm;}
.company-name{text-align:center;font-size:13px;font-weight:bold;margin-bottom:3mm;}
.divider{border-top:1px dashed #000;margin:2mm 0;}
.title{text-align:center;font-size:12px;font-weight:bold;letter-spacing:2px;margin:2mm 0;}
.row{display:flex;justify-content:space-between;margin:1mm 0;}
.label{color:#555;}
.qr-wrapper{text-align:center;margin:3mm 0;}
.qr-wrapper img{width:${qrSize};height:${qrSize};}
.ticket-id{text-align:center;font-size:9px;color:#555;margin-bottom:3mm;}
.powered-by{text-align:center;font-size:8px;color:#999;margin-top:3mm;}
@media print{body{margin:0;}@page{margin:0;size:${pageSize};}}
</style>
</head>
<body>
<div class="receipt-wrapper"><div class="receipt">
<div class="company-name">Volcano Express</div>
<div class="divider"></div>
<div class="title">TICKET</div>
<div class="divider"></div>
<div class="row"><span class="label">Passenger</span><span>Patrick Ishimwe</span></div>
<div class="row"><span class="label">Phone</span><span>+250788***888</span></div>
<div class="divider"></div>
<div class="row"><span class="label">From</span><span>Kigali</span></div>
<div class="row"><span class="label">To</span><span>Musanze</span></div>
<div class="row"><span class="label">Date</span><span>20 Apr 2026</span></div>
<div class="row"><span class="label">Time</span><span>08:00 AM</span></div>
<div class="divider"></div>
<div class="row"><span class="label">Seats</span><span>1</span></div>
<div class="row"><span class="label">Amount</span><span>RWF 2,500</span></div>
<div class="row"><span class="label">Method</span><span>Wallet</span></div>
<div class="divider"></div>
<div class="row"><span class="label">Bus</span><span>RAA 001 A</span></div>
<div class="divider"></div>
<div class="qr-wrapper"><img src="${qrPlaceholder}" alt="Scan to verify ticket" /></div>
<div class="ticket-id">${ticketId}</div>
<div class="divider"></div>
<div class="powered-by">powered by katisha online</div>
</div></div>
<script>window.onload=function(){window.print();}</script>
</body>
</html>`;
};

export const printHandlers = [
  http.get(`${baseUrl}/tickets/:id/print`, ({ params, request }) => {
    const userId = getAuthUserId(request);
    if (!userId) {
      return HttpResponse.json({ error: { code: "FORBIDDEN" } }, { status: 403 });
    }

    const ticketId = params.id as string;
    const url = new URL(request.url);
    const size = url.searchParams.get("size") ?? "80mm";

    const html = buildReceiptHtml(ticketId, size);
    return new HttpResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }),
];

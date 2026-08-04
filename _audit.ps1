# AUDITORIA
$ErrorActionPreference = 'Continue'
$k = 'sb_publishable_9uXrFJNgi89niSvsCRlG6g_s7qvBhq6'
$u = 'https://apxgkmllektcmrstuirw.supabase.co'
$site = 'https://ronaldobtc-code.github.io/mcu-tracker/'

Write-Output "=== 1. SITIO ==="
$t0 = Get-Date
$r = Invoke-WebRequest -Uri "$site`?v=$(Get-Random)" -UseBasicParsing -TimeoutSec 30
$ms = [math]::Round(((Get-Date) - $t0).TotalMilliseconds)
$c = [System.Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
Write-Output ("HTTP {0} | {1} ms | {2} KB" -f $r.StatusCode, $ms, [math]::Round($c.Length/1024,1))
Write-Output ("charset: " + $r.Headers['Content-Type'])
Write-Output ("HTTPS forzado: " + (if ($site -like 'https*') {'si'} else {'no'}))

Write-Output "`n=== 2. CONTENIDO ==="
$chk = [ordered]@{
  'mapamundi punteado'   = 'landLayer()'
  'siluetas continentes' = 'const LAND ='
  'estrellas'            = 'class="rate" data-title'
  'modal mapa'           = 'id="mapwrap"'
  'fondos TMDB'          = 'image.tmdb.org/t/p/'
  'Ken Burns'            = '@keyframes kb'
  'analitica'            = 'rpc/track_visit'
  'limpieza titulos'     = 'window.cleanTitle'
  'sesion Supabase'      = 'signInWithOtp'
  'atribucion TMDB'      = 'no esta avalado ni certificado'
  'aviso no oficial'     = 'Sin relacion con Marvel'
  'ko-fi'                = 'ko-fi.com/ronaldoramos71004'
  'reduced-motion'       = 'prefers-reduced-motion'
  'sin pixel art'        = 'crispEdges'
  'sin clave secreta'    = 'sb_secret'
}
foreach ($k2 in $chk.Keys) {
  $hit = $c -match [regex]::Escape($chk[$k2])
  $esperado = -not ($k2 -like 'sin *')
  $bien = ($hit -eq $esperado)
  Write-Output (("{0}  {1}" -f $(if($bien){'OK   '}else{'FALLA'}), $k2))
}

Write-Output "`n=== 3. API PUBLICA ==="
$v = curl.exe -s -w "|%{http_code}" -H "apikey: $k" -H "Authorization: Bearer $k" "$u/rest/v1/site_visits?select=country,hits"
Write-Output ("site_visits -> " + $v)
$a = curl.exe -s -w "|%{http_code}" -X POST -H "apikey: $k" -H "Authorization: Bearer $k" -H "Content-Type: application/json" -d "{}" "$u/rest/v1/rpc/get_country_activity"
Write-Output ("country_activity -> " + $a)
$s = curl.exe -s -w "|%{http_code}" -X POST -H "apikey: $k" -H "Authorization: Bearer $k" -H "Content-Type: application/json" -d "{}" "$u/rest/v1/rpc/get_review_stats"
Write-Output ("review_stats -> " + $s)

Write-Output "`n=== 4. FUGA DE DATOS (debe fallar) ==="
$leak1 = curl.exe -s -w "|%{http_code}" -H "apikey: $k" -H "Authorization: Bearer $k" "$u/rest/v1/reviews?select=*"
Write-Output ("reviews sin sesion -> " + $leak1)
$leak2 = curl.exe -s -w "|%{http_code}" -H "apikey: $k" -H "Authorization: Bearer $k" "$u/rest/v1/mcu_progress?select=*"
Write-Output ("mcu_progress sin sesion -> " + $leak2)

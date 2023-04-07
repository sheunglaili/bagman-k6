# Bagman K6 

Load testing script for Bagman.

## Prerequsite

- [K6](https://k6.io/)

## Getting started

The following bundle this script with webpack and and run it with [K6](https://k6.io/)

 `npm run load-test -- -e BAGMAN_HOST=localhost:8080` 

 To run with more virtual users and longer duration: 

 `npm run load-test -- -e BAGMAN_HOST=localhost:8080 -u 500 -d 60s`

 For more CLI options, please refer to [K6 Documentation](https://k6.io/docs)

 ## Stats 

 Result for running 500 concurrent users on single instance Bagman on a kubernetes node with droplet size of `s-2vcpu-2gb` hosted on Digitalocean with `npm run load-test -- -e BAGMAN_HOST=<BAGMAN_HOST_ADDRESS> -u 500 -d 50s`

 ```
data_received..................: 114 MB  1.5 MB/s
data_sent......................: 747 kB  9.9 kB/s
http_req_blocked...............: avg=56.32ms  min=56.32ms  med=56.32ms  max=56.32ms p(90)=56.32ms  p(95)=56.32ms 
http_req_connecting............: avg=56.15ms  min=56.15ms  med=56.15ms  max=56.15ms p(90)=56.15ms  p(95)=56.15ms 
http_req_duration..............: avg=42.14ms  min=42.14ms  med=42.14ms  max=42.14ms p(90)=42.14ms  p(95)=42.14ms 
{ expected_response:true }...: avg=42.14ms  min=42.14ms  med=42.14ms  max=42.14ms p(90)=42.14ms  p(95)=42.14ms 
http_req_failed................: 0.00%   ✓ 0            ✗ 1    
http_req_receiving.............: avg=91µs     min=91µs     med=91µs     max=91µs    p(90)=91µs     p(95)=91µs    
http_req_sending...............: avg=111µs    min=111µs    med=111µs    max=111µs   p(90)=111µs    p(95)=111µs   
http_req_tls_handshaking.......: avg=0s       min=0s       med=0s       max=0s      p(90)=0s       p(95)=0s      
http_req_waiting...............: avg=41.94ms  min=41.94ms  med=41.94ms  max=41.94ms p(90)=41.94ms  p(95)=41.94ms 
http_reqs......................: 1       0.013188/s
iteration_duration.............: avg=1m7s     min=98.84ms  med=1m11s    max=1m15s   p(90)=1m13s    p(95)=1m14s   
iterations.....................: 513     6.76539/s
vus............................: 37      min=37         max=500
vus_max........................: 500     min=500        max=500
ws_connecting..................: avg=772.32ms min=227.91ms med=356.45ms max=23.1s   p(90)=517.87ms p(95)=528.31ms
ws_msgs_received...............: 2150444 28359.828803/s
ws_msgs_sent...................: 8615    113.613712/s
ws_session_duration............: avg=1m7s     min=8.05s    med=1m11s    max=1m15s   p(90)=1m13s    p(95)=1m14s   
ws_sessions....................: 513     6.76539/s
 ```
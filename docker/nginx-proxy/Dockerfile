FROM nginxproxy/nginx-proxy
RUN { \
      echo 'client_max_body_size 10M;'; \
      echo 'add_header Cross-Origin-Opener-Policy same-origin;'; \
      echo 'add_header Cross-Origin-Embedder-Policy require-corp;'; \
} > /etc/nginx/conf.d/my_proxy.conf
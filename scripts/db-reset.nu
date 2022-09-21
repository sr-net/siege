rm -f dbschema/migrations/*
edgedb instance destroy -I siege --force
edgedb project init --non-interactive
open ~\AppData\Local\EdgeDB\config\credentials\siege.json | upsert host "127.0.0.1" | save ~\AppData\Local\EdgeDB\config\credentials\siege.json
edgedb migration create
edgedb migrate

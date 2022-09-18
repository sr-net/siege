rm dbschema/migrations/*
edgedb instance destroy -I siege --force
edgedb project init --non-interactive
edgedb migration create
edgedb migrate

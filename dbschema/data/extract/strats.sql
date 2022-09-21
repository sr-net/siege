SELECT json_agg(
    json_build_object(
           'uuid', uuid,
           'shortId', "shortId",
           'title', title,
           'description', description,
           'atk', atk,
           'def', def,
           'gamemode', string_to_array(gamemodes, ','),
           'score', score,
           'submission', submission,
           'acceptedAt', "acceptedAt",
           'createdAt', "createdAt",
           'author', json_build_object(
               'name', "authorName",
               'type', "authorType",
               'url', "authorUrl"
           )
        )
    ) AS strats
FROM strat;

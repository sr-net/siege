SELECT json_agg(
    json_build_object(
       'sessionId', "sessionUuid",
       'active', active,
       'strat', "stratUuid",
       'createdAt', "createdAt"
    )
) AS likes
FROM "like";

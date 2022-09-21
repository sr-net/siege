SELECT json_agg(
    json_build_object(
       'sessionId', "sessionUuid",
       'message', message,
       'strat', "stratUuid"
    )
) AS reports
FROM report;

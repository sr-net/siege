module default {
  abstract type EnhancedObject {
    required createdAt datetime {
      readonly := true;
      default := datetime_current();
    };
  }

  scalar type Gamemode extending enum<BOMBS, HOSTAGE, CAPTURE_AREAS>;

  type Strat extending EnhancedObject {
    required shortId: int32 {
      constraint exclusive;
      readonly := true;
    };
    required title: str;
    required description: str;
    required atk: bool;
    required def: bool;
    required gamemodes: array<Gamemode>;
    required score: int32;

    # Submission stuff
    required submission: bool {
      default := false;
    };
    acceptedAt: datetime;

    required author: Author;
    multi reports := .<strat[is Report];
    multi likes   := .<strat[is `Like`];

    index on ((.atk, .def, .gamemodes, .submission));
  }

  scalar type AuthorKind extending enum<NAME, YOUTUBE, TWITCH, REDDIT>;

  type Author extending EnhancedObject {
    required name: str {
      constraint exclusive;
    };
    required kind: AuthorKind;
    url: str;

    multi strats := .<author[is Strat];

    index on (.name);
  }

  type Report extending EnhancedObject {
    required sessionId: uuid;
    message: str;

    required link strat: Strat;

    index on (.sessionId);
  }

  type `Like` extending EnhancedObject {
    required sessionId: uuid;
             active: bool;

    required strat: Strat;

    index on (.sessionId);

    constraint exclusive on ((.strat, .sessionId));
  }
}

docker run -it --rm --link=edgedb -v edgedb-cli-config:C:\Users\bq\AppData\Local\EdgeDB edgedb/edgedb-cli -I vultr

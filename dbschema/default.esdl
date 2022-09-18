module default {
  abstract type EnhancedObject {
    required property createdAt -> datetime {
      readonly := true;
      default := datetime_current();
    };
  }

  scalar type Gamemode extending enum<BOMBS, HOSTAGE, CAPTURE_AREAS>;

  type Strat extending EnhancedObject {
    required property shortId    -> int32 {
      constraint exclusive;
      readonly := true;
    };
    required property title       -> str;
    required property description -> str;
    required property atk         -> bool;
    required property def         -> bool;
    required property gamemodes   -> array<Gamemode>;
    required property score       -> int32;

    # Submission stuff
    required property submission -> bool {
      default := false;
    };
             property acceptedAt -> datetime;

     required link author  -> Author;
        multi link reports := .<strat[is Report];
        multi link likes   := .<strat[is `Like`];

    index on ((.atk, .def, .gamemodes, .submission));
    # index on (.title);
  }

  scalar type AuthorKind extending enum<NAME, YOUTUBE, TWITCH, REDDIT>;

  type Author extending EnhancedObject {
    required property name -> str {
      constraint exclusive;
    };
    required property kind -> AuthorKind;
             property url -> str;

    multi link strats := .<author[is Strat];

    index on (.name);
  }

  type Report extending EnhancedObject {
    required property sessionId -> uuid;
             property message     -> str;

    required link strat -> Strat;

    index on (.sessionId);
  }

  type `Like` extending EnhancedObject {
    required property sessionId -> uuid;
             property active      -> bool;

    required link strat -> Strat;

    index on (.sessionId);
  }
}

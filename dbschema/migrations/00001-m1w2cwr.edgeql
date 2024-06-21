CREATE MIGRATION m1w2cwrzy6hjyjqfbxkh7z5dcgw6sg327l36novgc5whfltggmlmzq
    ONTO initial
{
  CREATE SCALAR TYPE default::Gamemode EXTENDING enum<BOMBS, HOSTAGE, CAPTURE_AREAS>;
  CREATE ABSTRACT TYPE default::EnhancedObject {
      CREATE REQUIRED PROPERTY createdAt -> std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
  };
  CREATE TYPE default::Strat EXTENDING default::EnhancedObject {
      CREATE REQUIRED PROPERTY gamemodes -> array<default::Gamemode>;
      CREATE REQUIRED PROPERTY atk -> std::bool;
      CREATE REQUIRED PROPERTY def -> std::bool;
      CREATE REQUIRED PROPERTY submission -> std::bool {
          SET default := false;
      };
      CREATE INDEX ON ((.atk, .def, .gamemodes, .submission));
      CREATE PROPERTY acceptedAt -> std::datetime;
      CREATE REQUIRED PROPERTY description -> std::str;
      CREATE REQUIRED PROPERTY score -> std::int32;
      CREATE REQUIRED PROPERTY shortId -> std::int32 {
          SET readonly := true;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY title -> std::str;
  };
  CREATE SCALAR TYPE default::AuthorKind EXTENDING enum<NAME, YOUTUBE, TWITCH, REDDIT>;
  CREATE TYPE default::Author EXTENDING default::EnhancedObject {
      CREATE REQUIRED PROPERTY name -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.name);
      CREATE REQUIRED PROPERTY kind -> default::AuthorKind;
      CREATE PROPERTY url -> std::str;
  };
  ALTER TYPE default::Strat {
      CREATE REQUIRED LINK author -> default::Author;
  };
  ALTER TYPE default::Author {
      CREATE MULTI LINK strats := (.<author[IS default::Strat]);
  };
  CREATE TYPE default::`Like` EXTENDING default::EnhancedObject {
      CREATE REQUIRED PROPERTY sessionId -> std::uuid;
      CREATE INDEX ON (.sessionId);
      CREATE REQUIRED LINK strat -> default::Strat;
      CREATE PROPERTY active -> std::bool;
  };
  CREATE TYPE default::Report EXTENDING default::EnhancedObject {
      CREATE REQUIRED PROPERTY sessionId -> std::uuid;
      CREATE INDEX ON (.sessionId);
      CREATE REQUIRED LINK strat -> default::Strat;
      CREATE PROPERTY message -> std::str;
  };
  ALTER TYPE default::Strat {
      CREATE MULTI LINK likes := (.<strat[IS default::`Like`]);
      CREATE MULTI LINK reports := (.<strat[IS default::Report]);
  };
};

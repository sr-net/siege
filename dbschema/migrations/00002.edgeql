CREATE MIGRATION m1jipudq7pa4lalttnm56ux6amyznl5i6h3kkzxyoxchsyirrasniq
    ONTO m1w2cwrzy6hjyjqfbxkh7z5dcgw6sg327l36novgc5whfltggmlmzq
{
  ALTER TYPE default::`Like` {
      CREATE CONSTRAINT std::exclusive ON ((.strat, .sessionId));
  };
};

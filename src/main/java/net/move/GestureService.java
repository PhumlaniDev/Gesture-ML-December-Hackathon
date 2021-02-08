package net.move;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

public interface GestureService {

    @SqlQuery("select * from Player")
    @RegisterBeanMapper(Player.class)
    List<Player> getPlayers();

    @SqlUpdate("insert into Player(player_name, player_age) values (?,?)")
    void addPlayer(String name, int age);

    @SqlUpdate("insert into scores (player_id) values (?)")
    void addScore(int playerID);

}

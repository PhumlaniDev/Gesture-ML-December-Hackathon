package net.gesture;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

public interface GestureMLService {

    @SqlQuery("select * from Player")
    @RegisterBeanMapper(Player.class)
    List<Player> getPlayers();

    @SqlUpdate("insert into Player(player_name, player_age) values (?,?)")
    void addPlayer(String name, int age);

}

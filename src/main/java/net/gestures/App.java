package net.gestures;

import com.github.jknack.handlebars.Handlebars;
import com.google.gson.Gson;
import org.jdbi.v3.core.Jdbi;
import org.jdbi.v3.sqlobject.SqlObjectPlugin;
import spark.ModelAndView;
import spark.template.handlebars.HandlebarsTemplateEngine;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static spark.Spark.*;

public class App {

    public static String render(Map<String, Object> model, String templatePath) {
        return new HandlebarsTemplateEngine().render(new ModelAndView(model, templatePath));
    }

    public static void main(String[] args) {
        Jdbi jdbi = Jdbi.create("jdbc:postgresql://localhost:5432/gesture_ml_db?user=konvi-dev&password=coder123");
        jdbi.installPlugin(new SqlObjectPlugin());
        staticFiles.location("/public");

        Gson gson = new Gson();


        get("/", (req, res) -> {
            Map paramsMap = new HashMap();
            return render(paramsMap, "index.handlebars");
        });


        get("/api/v1/players", (req, res) -> {
            List<Player> players = jdbi.withHandle(h -> {
                GestureService gestureService = h.attach(GestureService.class);
                return gestureService.getPlayers();
            });
            return players;
        }, gson::toJson);

        post("/api/v1/add/player", (req, res) -> {
            String playerName = req.queryParams("player-name");
            int playerAge = Integer.parseInt(req.queryParams("player-age"));

            jdbi.useHandle(handle -> {

                GestureService gestureService = handle.attach(GestureService.class);

                gestureService.addPlayer(playerName, playerAge);

            });
            return null;
        });


    }


}

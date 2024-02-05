open Cohttp
open Cohttp_lwt_unix
open Lwt.Infix

let news_api_url = "https://newsapi.org/v2/top-headlines"
let api_key = "450840edf26f48c18296e241b8342db6"

let fetch_news location ?category () =
  let uri =
    Uri.with_query'
      (Uri.of_string news_api_url)
      [ ("country", [location]); ("apiKey", [api_key]) ]
  in
  match category with
  | Some c -> Uri.add_query_param' uri ("category", [c])
  | None -> uri

let get_news_handler req _body =
  let uri = Uri.of_string (Uri.path (Request.uri req)) in
  let location = Uri.get_query_param uri "location" |> Option.value ~default:"us" in
  let news_uri = fetch_news location () in
  Client.get news_uri >>= fun (_, body) ->
  Cohttp_lwt.Body.to_string body >|= fun body ->
  Server.respond_string ~status:`OK ~body ()

let get_news_by_category_handler req _body =
  let uri = Uri.of_string (Uri.path (Request.uri req)) in
  let location = Uri.get_query_param uri "location" |> Option.value ~default:"us" in
  let category = Uri.get_query_param uri "category" |> Option.value ~default:"general" in
  let news_uri = fetch_news location ~category () in
  Client.get news_uri >>= fun (_, body) ->
  Cohttp_lwt.Body.to_string body >|= fun body ->
  Server.respond_string ~status:`OK ~body ()

let server =
  let callback _conn req body =
    let uri_path = Uri.path (Request.uri req) in
    match uri_path with
    | "/news" -> get_news_handler req body
    | "/news/category" -> get_news_by_category_handler req body
    | _ -> Server.respond_string ~status:`Not_found ~body:"Not Found" ()
  in
  Server.create ~mode:(`TCP (`Port 6001)) (Server.make ~callback ())

let () = ignore (Lwt_main.run server)

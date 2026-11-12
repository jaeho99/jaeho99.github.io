package dev.backendlog;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import static org.junit.Assert.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = WebConfig.class)
public class DemoControllerTest {
    @Autowired private WebApplicationContext context;
    private MockMvc mvc;

    @Before
    public void setUp() { mvc = MockMvcBuilders.webAppContextSetup(context).build(); }

    @Test
    public void brokenResolvesToJspEvenWhenJsonIsAccepted() throws Exception {
        mvc.perform(get("/demo/broken").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(view().name("result"))
                .andExpect(forwardedUrl("/WEB-INF/views/result.jsp"));
    }

    @Test
    public void threeSolutionsReturnEquivalentJson() throws Exception {
        for (String endpoint : new String[] {"body", "named-view", "direct-view"}) {
            MvcResult result = mvc.perform(get("/demo/" + endpoint).accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                    .andReturn();
            assertEquals(new ObjectMapper().readTree("{\"message\":\"hello\"}"),
                    new ObjectMapper().readTree(result.getResponse().getContentAsString()));
        }
    }
}

